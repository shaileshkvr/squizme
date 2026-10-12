import Groq from "groq-sdk";
import { env } from "../../config/env.js";

export function getGroqClient(apiKeyOverride?: string): Groq | null {
  const key = apiKeyOverride || env.GROQ_API_KEY;
  if (!key) {
    return null;
  }
  return new Groq({ apiKey: key });
}

export function isGroqConfigured(apiKeyOverride?: string): boolean {
  return Boolean(apiKeyOverride || env.GROQ_API_KEY);
}
