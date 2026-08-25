import { describe, expect, it, vi } from "vitest";

import { IntentService } from "../intent.service.js";
import type { AgentIntent } from "../intent.types.js";
import type { LlmService } from "../../../llm/llm.service.js";

function createLlmMock(intent: AgentIntent): LlmService {
  return {
    generate: vi.fn(),
    generateStructured: vi.fn().mockResolvedValue({
      intent,
    }),
  } as unknown as LlmService;
}

describe("IntentService", () => {
  it("classifies a read query", async () => {
    const llm = createLlmMock("READ_QUERY");
    const service = new IntentService(llm);

    const result = await service.classify(
      "Show me all customers",
    );

    expect(result).toBe("READ_QUERY");
  });

  it("classifies a write operation", async () => {
    const llm = createLlmMock("WRITE_OPERATION");
    const service = new IntentService(llm);

    const result = await service.classify(
      "Wipe all customer records",
    );

    expect(result).toBe("WRITE_OPERATION");
  });

  it("classifies an unsupported request", async () => {
    const llm = createLlmMock("UNSUPPORTED");
    const service = new IntentService(llm);

    const result = await service.classify(
      "What is the weather today?",
    );

    expect(result).toBe("UNSUPPORTED");
  });

  it("passes the question to the LLM", async () => {
    const llm = createLlmMock("READ_QUERY");
    const service = new IntentService(llm);

    await service.classify("Show me all customers");

    expect(llm.generateStructured).toHaveBeenCalledOnce();

    expect(llm.generateStructured).toHaveBeenCalledWith(
      expect.objectContaining({
        userPrompt: "Show me all customers",
      }),
    );
  });

  it("rejects an invalid LLM intent", async () => {
    const llm = {
      generate: vi.fn(),
      generateStructured: vi.fn().mockResolvedValue({
        intent: "SOMETHING_ELSE",
      }),
    } as unknown as LlmService;

    const service = new IntentService(llm);

    await expect(
      service.classify("Show me customers"),
    ).rejects.toMatchObject({
      code: "INVALID_LLM_INTENT",
    });
  });

  it("handles LLM failures", async () => {
    const llm = {
      generate: vi.fn(),
      generateStructured: vi
        .fn()
        .mockRejectedValue(
          new Error("Gemini unavailable"),
        ),
    } as unknown as LlmService;

    const service = new IntentService(llm);

    await expect(
      service.classify("Show me customers"),
    ).rejects.toMatchObject({
      code: "LLM_INTENT_CLASSIFICATION_FAILED",
    });
  });
});