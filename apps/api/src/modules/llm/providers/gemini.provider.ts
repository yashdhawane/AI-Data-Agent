import { GoogleGenAI } from "@google/genai";

import type {
  LlmGenerateRequest,
  LlmGenerateResponse,
  LlmProvider,
  LlmStructuredGenerateRequest,
} from "../llm.types.js";

export class GeminiProvider implements LlmProvider {
  private readonly client: GoogleGenAI;

  constructor(
    apiKey: string,
    private readonly model: string,
  ) {
    this.client = new GoogleGenAI({
      apiKey,
    });
  }

  async generate(
    request: LlmGenerateRequest,
  ): Promise<LlmGenerateResponse> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: request.userPrompt,
      config: {
        systemInstruction: request.systemPrompt,
      },
    });

    return {
      content: response.text ?? "",
    };
  }

  async generateStructured<T>(
  request: LlmStructuredGenerateRequest,
): Promise<T> {
  const response =
    await this.client.models.generateContent({
      model: this.model,
      contents: request.userPrompt,
      config: {
        systemInstruction: request.systemPrompt,
        responseMimeType: "application/json",
        responseSchema: request.responseSchema,
      },
    });

  const content = response.text;

  if (!content) {
    throw new Error(
      "LLM returned an empty structured response",
    );
  }

  return JSON.parse(content) as T;
}
}