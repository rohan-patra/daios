export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  type: "connection_request" | "github_inspection";
  account_type?: "github" | "twitter" | "wallet";
  account?: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  status: "in_progress" | "accepted" | "rejected";
  connectedAccounts: {
    github?: boolean;
    twitter?: boolean;
    wallet?: boolean;
  };
  criteria?: Array<{
    title: string;
    description: string;
    icon: string;
    verified: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ChatStorage {
  [chatId: string]: ChatSession;
}

export interface ChatResponse {
  message: string;
  chatId: string;
  status: "in_progress" | "accepted" | "rejected";
  toolCalls?: ToolCall[];
}

export interface ChatError {
  error: string;
}
