import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://0.0.0.0:8000"; 

async function callPythonAPI(functionName: string, payload: object) {
  try {
    const response = await fetch(`${BASE_URL}/${functionName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Error calling ${functionName}:`, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to call ${functionName}:`, error);
    return null;
  }
}

function sanitizeOpenAIResponse(response: string): string {
  let sanitized = response.trim();
  sanitized = sanitized.replace(/^```(\w+)?/gm, "").replace(/```$/gm, "");
  return sanitized.trim();
}

export async function POST(req: NextRequest) {
  try {
    // 1) Parse Request Body
    const body = await req.json();
    const { daoName, daoDescription, personName, username } = body;

    // Basic Validations
    if (!daoName || !daoDescription || !personName) {
      return NextResponse.json(
        { error: "Missing 'daoName', 'daoDescription', or 'personName' parameter" },
        { status: 400 }
      );
    }

    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || "";
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

    if (!PERPLEXITY_API_KEY || !OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "API keys are missing" },
        { status: 500 }
      );
    }

    //--------------------------------------------------------------------------
    // STEP 1: Generate a JSON schema from OpenAI
    //--------------------------------------------------------------------------
    const schemaGenResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
        model: "gpt-4",
        messages: [
            {
            role: "system",
            content:
                "You are an AI that generates a *valid JSON schema* for evaluating membership eligibility based on an organization's description. Should have 20-25 fields that cover different aspects of the organization's description. Fields have be to objective that can be determined using knowledge online. " +
                "Return only valid JSON—no markdown or extra text.",
            },
            {
            role: "user",
            content: `Generate a detailed JSON schema that outlines the eligibility criteria for a person to join the organization described below. 
            Include criteria relevant to the organization's focus areas. For example, if it's a medical organization, include research, publications, or citations; if it's a coding organization, include GitHub activity, tweets, etc.
                    
            Organization Name: ${daoName}
            Organization Description: ${daoDescription}
            Prospective Member Name: ${personName}
            
            The schema should cover:
            - Specific eligibility criteria based on the organization's focus (e.g., technical, research, social influence). This eligibility should be verifiable, ensuring that the schema can be used to evaluate a prospective member's qualifications based on the organization's description. They have to be objective that can be determined online.
            - Sections for verifying the prospective member's qualifications relevant to these criteria.
            Ensure the JSON is properly closed and is detailed, with a minimum of 10-15 different criteria and fields, which are diverse and cover a variety of different aspects.`,
                    },
                ],
                max_tokens: 2000,
                temperature: 0.0,
        }),
    });
  

    const schemaGenData = await schemaGenResponse.json();
    const rawSchema = schemaGenData.choices?.[0]?.message?.content || "";
    const schemaContent = sanitizeOpenAIResponse(rawSchema);

    let generatedSchema;
    try {
      generatedSchema = JSON.parse(schemaContent);
    } catch (e) {
      console.error("Failed to parse JSON schema:", e);
      console.error("Original schemaContent:", schemaContent);
      return NextResponse.json(
        { error: "Failed to parse JSON schema from OpenAI" },
        { status: 500 }
      );
        }
        
    //--------------------------------------------------------------------------
    // STEP 2: Gather info from Perplexity (Person Only)
    //--------------------------------------------------------------------------
    const refinedQuery = `
    Please gather any verifiable information about the person named "${personName}". 
    Focus on:
    - Their background, expertise, or notable achievements
    - Any publicly known research, publications, or projects
    - Any associated GitHub repos, Twitter handles, or social platforms
    - Roles or positions they have held

    Return plain text only (no markdown), and avoid speculation or unverifiable data.
    `;

    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
        model: "sonar-pro",
        messages: [
        {
            role: "system",
            content: "Provide factual, plain-text responses only. Avoid speculation.",
        },
        { role: "user", content: refinedQuery },
        ],
        max_tokens: 1000,
        temperature: 0.7,
    }),
    });

    if (!perplexityResponse.ok) {
    const errorText = await perplexityResponse.text();
    console.error("Perplexity API Error:", errorText);
    return NextResponse.json({ error: errorText }, { status: perplexityResponse.status });
    }

    const perplexityData = await perplexityResponse.json();
    const rawEvaluation = perplexityData.choices?.[0]?.message?.content || "No data available.";

    console.log("Perplexity rawEvaluation:", rawEvaluation);

    //--------------------------------------------------------------------------
    // STEP 3: Populate the JSON schema with Perplexity info (ONE OpenAI call)
    //--------------------------------------------------------------------------
    const structureResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are an AI that converts unstructured text into a structured JSON object based on a provided JSON schema. " +
              "Return only valid JSON. No markdown, no extra text.",
          },
          {
            role: "user",
            content: `JSON Schema to follow:
            ${JSON.stringify(generatedSchema, null, 2)}

            Raw Info:
            ${rawEvaluation}

            Output a JSON object strictly conforming to the above schema, filling in details from the Raw Info.`,
          },
        ],
        max_tokens: 500,
        temperature: 0.0,
      }),
    });

    const structureData = await structureResponse.json();
    const messageContent = sanitizeOpenAIResponse(
      structureData.choices?.[0]?.message?.content || ""
    );

    let finalJSON;
    try {
      finalJSON = JSON.parse(messageContent);
    } catch (err) {
      console.error("Failed to parse final JSON:", err);
      console.error("Original content:", messageContent);
      return NextResponse.json(
        { error: "Failed to parse final JSON from OpenAI" },
        { status: 500 }
      );
    }

    let functions = ["twitter", "github", "etherscan"];
    let suggestedFunctions;

    try {
        const functionsOutputResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                role: "system",
                content:
                    `You are given a membership schema with possible fields to fill. Some of them :
                    ${JSON.stringify(finalJSON, null, 2)}
                    
                    You have a list of functions you can call to update or add data to the schema. 
                    Figure out which functions would be relevant to properly enrich this schema 
                    given the prospective member's background and the organization's requirements. 
                    Return your suggested function call(s). Here are the functions you can call:
                    ${JSON.stringify(functions, null, 2)}

                    Return me a list of functions in the format that could be used:

                    [
                        function1,
                        ...
                    ]`,
                }
                ],
                max_tokens: 2000,
                temperature: 0.0,
            }),
        });
        const functionsOutputData = await functionsOutputResponse.json();

        // Extract the function call suggestions
        const functionsOutputContent = sanitizeOpenAIResponse(
            functionsOutputData.choices?.[0]?.message?.content || "[]"
        );

        try {
            suggestedFunctions = JSON.parse(functionsOutputContent);
        } catch (err) {
            console.error("Failed to parse function suggestions:", err);
            console.error("Original functionsOutputContent:", functionsOutputContent);
            return NextResponse.json(
                { error: "Failed to parse function suggestions from OpenAI" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }


    for (const functionName of suggestedFunctions) {
    console.log(`Calling ${functionName} on Python server...`);

    const apiResponse = await callPythonAPI(functionName, { username });

    if (apiResponse) {
        console.log(`Received response from ${functionName}:`, apiResponse);
    }

    }
    // All done!
    return NextResponse.json(finalJSON, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
