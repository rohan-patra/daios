import { env } from "@/env";
import { OpenAI } from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { type ChatCompletion } from "openai/resources";
import { type NextRequest } from "next/server";

type RequestBody = {
  prompt: string;
  daoName: string;
  tokenSymbol: string;
};

type CriteriaResponse = {
  criteria: Array<{
    title: string;
    description: string;
    icon: "github" | "twitter" | "wallet" | "generic";
  }>;
};

if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { prompt, daoName, tokenSymbol } = body;

    const systemPrompt = `You are an AI tasked with evaluating DAO membership applications. Given the following description of eligibility criteria for the DAO "${daoName}" (${tokenSymbol}), generate professional, abstract criteria summaries.

IMPORTANT RULES:
1. Only use concepts EXPLICITLY provided in the user's description
2. Do not add requirements that weren't mentioned
3. Do not split a single requirement into multiple similar ones
4. Generate ONLY the number of criteria that are actually distinct in the description
5. Make each criterion abstract and professional, avoiding direct quotes or specific wording from the input
6. Use the most appropriate icon for each criterion:
   - github: for code and technical contributions
   - twitter: for social and community engagement (ONLY if specifically mentioned)
   - wallet: for financial or on-chain activity (ONLY if specifically mentioned)
   - generic: for values, principles, and any criteria that doesn't fit the above

Format the response as a JSON object with a 'criteria' array containing objects for each distinct criterion mentioned:
- title: A professional, generalized title that captures the essence of the requirement
- description: A polished, abstract description that conveys the requirement without mirroring the input text
- icon: One of "github", "twitter", "wallet", or "generic" (use ONLY relevant icons)

Example format:
{
  "criteria": [
    {
      "title": "Technical Expertise",
      "description": "Demonstrated excellence in blockchain development through substantial open-source contributions",
      "icon": "github"
    }
  ]
}

Remember: Focus on conveying the essence of each requirement in a professional, abstract manner without revealing the exact input phrasing.`;

    const userPrompt = `DAO Description: ${prompt}

Generate abstract, professional criteria based on the core requirements in the description. Avoid mirroring the exact input text.`;

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const completion = (await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      temperature: 0.7,
      response_format: { type: "json_object" },
    })) satisfies ChatCompletion;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const content = completion.choices[0]?.message.content;
    if (typeof content !== "string") {
      throw new Error("No content in response");
    }

    try {
      const parsedContent = JSON.parse(content) as CriteriaResponse;
      if (!parsedContent.criteria || !Array.isArray(parsedContent.criteria)) {
        throw new Error("Invalid response format");
      }
      return Response.json({ criteria: parsedContent.criteria });
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return Response.json(
        { error: "Failed to parse criteria" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in generate-criteria:", error);
    return Response.json(
      { error: "Failed to generate criteria" },
      { status: 500 },
    );
  }
}
