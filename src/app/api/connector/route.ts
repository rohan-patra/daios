import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getStoredData }  from "@/utils/session";

const BASE_URL = "http://0.0.0.0:8000";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const functionName = searchParams.get("functionName");
    const username = searchParams.get("username");
    const sessionID = searchParams.get("sessionID") || "";
    

    // Basic validation
    if (!functionName || !username) {
      return NextResponse.json(
        { error: "Missing 'functionName' or 'username' parameter" },
        { status: 400 }
      );
    }


    // Retrieve personData (JSON schema) from cookies
    const rawPersonData = await getStoredData(sessionID) || null; // ✅ Await added
    console.log("rawPersonData", rawPersonData);

    if (!rawPersonData) {
      return NextResponse.json(
        { error: "No person data found in cookies" },
        { status: 400 }
      );
    }

    let personData;
    try {
      personData = JSON.parse(rawPersonData);
    } catch (error) {
      console.error("Failed to parse personData:", error);
      return NextResponse.json(
        { error: "Invalid JSON format in stored personData" },
        { status: 500 }
      );
    }    

    // Make the API call
    const response = await fetch(`${BASE_URL}/${functionName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }) // ✅ Correct way
      });
      

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error calling ${functionName}:`, errorText);
      return NextResponse.json(
        { error: `Failed to call function '${functionName}'` },
        { status: response.status }
      );
    }

    const newData = await response.json();

    // Call OpenAI to update personData with newData while keeping the schema intact
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
              "You are an AI that updates a JSON schema by incorporating new data while strictly maintaining the original structure and field names.",
          },
          {
            role: "user",
            content: `Given the following JSON schema:

            ${JSON.stringify(personData, null, 2)}

            And the new data:

            ${JSON.stringify(newData, null, 2)}

            Update the JSON schema using relevant information from the new data, ensuring the schema remains the same in structure but now contains more extracted data from the new data.

            Return only valid JSON—no markdown or extra text.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.0,
      }),
    });

    const openAIData = await openAIResponse.json();
    const updatedPersonDataRaw = openAIData.choices?.[0]?.message?.content || "{}";

    let updatedPersonData;
    try {
      updatedPersonData = JSON.parse(updatedPersonDataRaw);
    } catch (error) {
      console.error("Failed to parse updatedPersonData:", error);
      return NextResponse.json(
        { error: "Failed to parse updated JSON from OpenAI" },
        { status: 500 }
      );
    }

    // Store the updated personData back in cookies

    return NextResponse.json(updatedPersonData, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
