import { GeminiProvider } from "./providers/gemini.provider.js";
import { LlmService } from "./llm.service.js";

export function createLlmService(): LlmService {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!model) {
    throw new Error("GEMINI_MODEL is not configured");
  }

  const provider = new GeminiProvider(
    apiKey,
    model,
  );

  return new LlmService(provider);
}