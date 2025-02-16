import { env } from "@/env";
import { OpenAI } from "openai";
import { type ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { type ChatCompletion } from "openai/resources";
import { type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import path from "path";
import {
  type ChatMessage,
  type ChatSession,
  type ChatStorage,
} from "@/types/chat";
import { type ToolCall } from "openai/resources/chat/completions";
import { type Address } from "viem";

if (!env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const CHATS_FILE = path.join(process.cwd(), "data/chats.json");

async function fetchEtherscanData(
  wallet_address: string,
  chain_id: number = 1,
) {
  try {
    const response = await fetch("http://localhost:8001/etherscan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet_address, chain_id }),
    });

    if (!response.ok) {
      throw new Error(`Etherscan API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Etherscan fetch error:", error);
    return null;
  }
}

async function fetchGithubData(username: string) {
  try {
    const response = await fetch("http://localhost:8001/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return null;
  }
}

async function fetchTwitterData(username: string) {
  try {
    const response = await fetch("http://localhost:8001/twitter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Twitter fetch error:", error);
    return null;
  }
}

async function ensureChatsFile() {
  try {
    await fs.mkdir(path.dirname(CHATS_FILE), { recursive: true });
    try {
      await fs.access(CHATS_FILE);
    } catch {
      await fs.writeFile(CHATS_FILE, JSON.stringify({}));
    }
  } catch (error) {
    console.error("Error ensuring chats file:", error);
    throw error;
  }
}

async function loadChats(): Promise<ChatStorage> {
  await ensureChatsFile();
  const content = await fs.readFile(CHATS_FILE, "utf-8");
  return JSON.parse(content) as ChatStorage;
}

async function saveChats(chats: ChatStorage) {
  await ensureChatsFile();
  await fs.writeFile(CHATS_FILE, JSON.stringify(chats, null, 2));
}

const systemPrompt = `You are an AI evaluator for DAO membership applications. Your role is to:

1. Systematically verify EACH eligibility criterion in order, one at a time
2. Request account connections (GitHub, Twitter, Wallet) when needed to verify specific criteria
3. Track and confirm which criteria have been met
4. Make a final decision only after ALL criteria have been verified

Follow these rules:
- Start by explaining the evaluation process
- For each criterion:
  1. State which criterion you're currently evaluating
  2. Request the relevant account connection if needed
  3. After receiving a connection, explicitly confirm the username/address received
  4. Analyze the data from the respective API endpoint and use to evaluate if the criterion is met
  5. Verify if the criterion is met before moving to the next one

- Do not proceed to the next criterion until the current one is fully verified
- Keep track of which criteria are verified and which are pending
- Make decisions based ONLY on the verified criteria
- Provide clear feedback for each verification step
- Each message from you should either be the final tool call or a prompt for the user to respond to

IMPORTANT: You must respond in JSON format with this structure:
{
  "message": "Your response message here",
  "toolCalls": [
    {
      "type": "connection_request",
      "account_type": "github" // or "twitter" or "wallet"
    }
  ],
  "mint": boolean // Set to true ONLY when ALL criteria are verified and met
}

Guidelines for responses:
1. When starting a new chat:
   - Explain that you'll verify each criterion in order
   - Start with the first criterion
   - Request relevant connection if needed

2. After receiving a connection:
   - Acknowledge the specific account connected (e.g., "I see you've connected your GitHub account: username")
   - Verify if this connection satisfies the current criterion
   - Either mark the criterion as verified or explain why it's not met
   - Move to the next criterion only after current is verified

3. When making a decision:
   - For acceptance: Confirm ALL criteria are met, set mint to true
   - For rejection: List specific criteria that weren't met

The toolCalls array is optional and should only be included when you need to request account connections.
Your responses in the "message" field should be professional, encouraging, and clear.`;

interface AccountConnection {
  type: "github" | "twitter" | "wallet";
  connected: boolean;
  data?: {
    github?: string;
    twitter?: string;
    wallet?: Address;
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log("Received chat request");
    const body = (await req.json()) as {
      message: string;
      chatId?: string;
      daoName: string;
      tokenSymbol: string;
      criteria: Array<{ title: string; description: string; icon: string }>;
      accountConnection?: AccountConnection;
    };

    console.log("Request body:", {
      message: body.message,
      chatId: body.chatId,
      daoName: body.daoName,
      tokenSymbol: body.tokenSymbol,
      hasAccountConnection: !!body.accountConnection,
      accountData: body.accountConnection?.data,
    });

    const {
      message,
      chatId,
      daoName,
      tokenSymbol,
      criteria,
      accountConnection,
    } = body;

    const chats = await loadChats();
    let currentChat: ChatSession;

    if (chatId && chats[chatId]) {
      console.log("Using existing chat:", chatId);
      currentChat = chats[chatId];
      let updatedMessage = message;
      if (accountConnection) {
        currentChat.connectedAccounts[accountConnection.type] =
          accountConnection.connected;
        const accountData = accountConnection.data?.[accountConnection.type];

        if (accountData) {
          console.log(
            `Fetching ${accountConnection.type} data for:`,
            accountData,
          );

          if (accountConnection.type === "github") {
            const githubData = await fetchGithubData(accountData);
            if (githubData) {
              currentChat.messages.push({
                role: "system",
                content: `GitHub Activity Summary:\n ${JSON.stringify(githubData, null, 2)}`,
                timestamp: new Date().toISOString(),
              });
            }
          } else if (accountConnection.type === "twitter") {
            const twitterData = await fetchTwitterData(accountData);
            if (twitterData) {
              currentChat.messages.push({
                role: "system",
                content: `Twitter Activity Summary:\n ${JSON.stringify(twitterData, null, 2)}`,
                timestamp: new Date().toISOString(),
              });
            }
          } else if (accountConnection.type === "wallet") {
            const etherscanData = await fetchEtherscanData(accountData);
            if (etherscanData) {
              currentChat.messages.push({
                role: "system",
                content: `Etherscan Wallet Summary:\n ${JSON.stringify(etherscanData, null, 2)}`,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      }

      currentChat.messages.push({
        role: "user",
        content: updatedMessage,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("Creating new chat session");
      const newChatId = uuidv4();
      currentChat = {
        id: newChatId,
        messages: [
          {
            role: "system",
            content: systemPrompt,
            timestamp: new Date().toISOString(),
          },
          {
            role: "system",
            content: `DAO Name: ${daoName}\nToken Symbol: ${tokenSymbol}\n\nCriteria:\n${criteria
              .map((c) => `- ${c.title}: ${c.description}`)
              .join("\n")}`,
            timestamp: new Date().toISOString(),
          },
        ],
        status: "in_progress",
        connectedAccounts: {},
        criteria: criteria.map((c) => ({ ...c, verified: false })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      currentChat.messages.push({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("Calling OpenAI API");
    const messages: ChatCompletionMessageParam[] = currentChat.messages.map(
      ({ role, content }) => ({
        role,
        content,
      }),
    );

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      console.log("Received OpenAI response");
      const content = completion.choices[0]?.message.content;
      if (!content) throw new Error("No content in response");

      try {
        console.log("Parsing response:", content);
        const parsedContent = JSON.parse(content) as {
          message: string;
          toolCalls?: ToolCall[];
          mint?: boolean;
        };

        // Filter out github_inspection tool calls
        const filteredToolCalls = parsedContent.toolCalls?.filter(
          (call) => call.type === "connection_request",
        );

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: parsedContent.message,
          timestamp: new Date().toISOString(),
          toolCalls: filteredToolCalls,
        };

        currentChat.messages.push(assistantMessage);
        currentChat.updatedAt = new Date().toISOString();

        // Check for mint flag
        if (parsedContent.mint === true) {
          currentChat.status = "accepted";
          assistantMessage.content =
            "Congratulations! You have been accepted into the DAO. 🎉";
        } else if (
          assistantMessage.content.toLowerCase().includes("unfortunately") &&
          assistantMessage.content.toLowerCase().includes("reject")
        ) {
          currentChat.status = "rejected";
        }

        chats[currentChat.id] = currentChat;
        await saveChats(chats);

        console.log("Sending response:", {
          messageLength: assistantMessage.content.length,
          chatId: currentChat.id,
          status: currentChat.status,
          hasToolCalls: !!assistantMessage.toolCalls?.length,
        });

        return Response.json({
          message: assistantMessage.content,
          chatId: currentChat.id,
          status: currentChat.status,
          toolCalls: assistantMessage.toolCalls,
        });
      } catch (parseError) {
        console.error(
          "Error parsing OpenAI response:",
          parseError,
          "\nContent:",
          content,
        );
        return Response.json(
          { error: "Failed to parse OpenAI response" },
          { status: 500 },
        );
      }
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);
      return Response.json(
        { error: "Failed to get AI response" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Request processing error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 400 },
    );
  }
}
