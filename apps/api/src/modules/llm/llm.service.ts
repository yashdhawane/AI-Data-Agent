import type {
  LlmGenerateRequest,
  LlmGenerateResponse,
  LlmProvider,
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
}