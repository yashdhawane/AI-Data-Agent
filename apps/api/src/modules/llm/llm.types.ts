export interface LlmGenerateRequest {
  systemPrompt: string;
  userPrompt: string;
}

export interface LlmGenerateResponse {
  content: string;
}

export interface LlmProvider {
  generate(
    request: LlmGenerateRequest,
  ): Promise<LlmGenerateResponse>;
}