import type {
  LlmGenerateRequest,
  LlmGenerateResponse,
  LlmProvider,
  LlmStructuredGenerateRequest,
} from "./llm.types.js";

export class LlmService {
  constructor(
    private readonly provider: LlmProvider,
  ) {}

  async generate(
    request: LlmGenerateRequest,
  ): Promise<LlmGenerateResponse> {
    return this.provider.generate(request);
  }

  async generateStructured<T>(
    request: LlmStructuredGenerateRequest,
  ): Promise<T> {
    return this.provider.generateStructured<T>(request);
  }
}