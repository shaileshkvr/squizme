import Groq from "groq-sdk";
import { env } from "../../../config/env.js";

export function createGroqClient(apiKeyOverride?: string): Groq {
  const key = apiKeyOverride || env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey: key });
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CallGroqParams {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export async function callGroqChat(
  client: Groq,
  params: CallGroqParams
): Promise<string> {
  const response = await client.chat.completions.create({
    model: params.model || env.GROQ_MODEL,
    messages: params.messages,
    temperature: params.temperature ?? env.GROQ_TEMPERATURE,
    max_tokens: params.maxTokens ?? env.GROQ_MAX_TOKENS,
    response_format:
      params.responseFormatJson !== false ? { type: "json_object" } : undefined,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned empty response content");
  }
  return content;
}
