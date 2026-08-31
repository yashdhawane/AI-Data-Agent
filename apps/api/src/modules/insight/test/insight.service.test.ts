import { describe, expect, it, vi } from "vitest";
import { InsightService } from "../insight.service.js";
import type { LlmService } from "../../llm/llm.service.js";

const validInsight = {
  summary: "Revenue increased.",
  facts: ["Revenue was higher in the selected period."],
  inferences: ["The increase may reflect stronger order volume."],
  recommendations: ["Review the highest-growth products."],
  unknowns: ["Marketing attribution was not available."],
  confidence: "MEDIUM" as const,
};

function createLlm(response: unknown): LlmService {
  return { generate: vi.fn(), generateStructured: vi.fn().mockResolvedValue(response) } as unknown as LlmService;
}

describe("InsightService", () => {
  const input = {
    question: "Why did revenue change?",
    sql: "SELECT SUM(amount) FROM orders",
    columns: ["sum"],
    rows: [{ sum: 100 }],
  };

  it("returns a structured insight", async () => {
    const llm = createLlm(validInsight);
    await expect(new InsightService(llm).generate(input)).resolves.toEqual(validInsight);
    expect(llm.generateStructured).toHaveBeenCalledOnce();
  });

  it("rejects malformed insight responses", async () => {
    await expect(new InsightService(createLlm({ summary: "missing fields" })).generate(input)).rejects.toMatchObject({ code: "INVALID_LLM_INSIGHT" });
  });

  it("maps provider failures", async () => {
    const llm = { generate: vi.fn(), generateStructured: vi.fn().mockRejectedValue(new Error("provider unavailable")) } as unknown as LlmService;
    await expect(new InsightService(llm).generate(input)).rejects.toMatchObject({ code: "LLM_INSIGHT_GENERATION_FAILED" });
  });
});
