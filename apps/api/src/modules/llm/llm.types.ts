export interface LlmGenerateRequest {
  systemPrompt: string;
  userPrompt: string;
}

export interface LlmGenerateResponse {
  content: string;
}

export interface LlmStructuredGenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  responseSchema: Record<string, unknown>;
}

export interface LlmProvider {
  generate(
    request: LlmGenerateRequest,
  ): Promise<LlmGenerateResponse>;

  generateStructured<T>(
    request: LlmStructuredGenerateRequest,
  ): Promise<T>;
}