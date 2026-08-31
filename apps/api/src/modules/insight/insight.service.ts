import { AppError } from "../../infrastructure/http/app-error.js";
import type { LlmService } from "../llm/llm.service.js";
import type { InsightInput, InsightResponse } from "./insight.types.js";

function isInsightResponse(value: unknown): value is InsightResponse {
  if (!value || typeof value !== "object") return false;
  const insight = value as Record<string, unknown>;
  return typeof insight.summary === "string" &&
    Array.isArray(insight.facts) && insight.facts.every((item) => typeof item === "string") &&
    Array.isArray(insight.inferences) && insight.inferences.every((item) => typeof item === "string") &&
    Array.isArray(insight.recommendations) && insight.recommendations.every((item) => typeof item === "string") &&
    Array.isArray(insight.unknowns) && insight.unknowns.every((item) => typeof item === "string") &&
    (insight.confidence === "LOW" || insight.confidence === "MEDIUM" || insight.confidence === "HIGH");
}

export class InsightService {
  constructor(private readonly llmService: LlmService) {}

  async generate(input: InsightInput): Promise<InsightResponse> {
    try {
      const response = await this.llmService.generateStructured<InsightResponse>({
        systemPrompt: `You are an analytics insight assistant. Answer the user's question using only the supplied query results and business context. Separate directly observed facts from inferences. Recommendations must be practical next steps, not claims. List important missing information under unknowns. Never invent numbers, causes, or data. Return concise, clear business language. Confidence reflects how strongly the supplied evidence supports the summary.`,
        userPrompt: JSON.stringify({
          question: input.question,
          businessContext: input.businessContext ?? "No business context configured.",
          generatedQuery: input.sql,
          result: { columns: input.columns, rows: input.rows, rowCount: input.rows.length },
        }),
        responseSchema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            facts: { type: "array", items: { type: "string" } },
            inferences: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            unknowns: { type: "array", items: { type: "string" } },
            confidence: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          },
          required: ["summary", "facts", "inferences", "recommendations", "unknowns", "confidence"],
        },
      });

      if (!isInsightResponse(response)) {
        throw new AppError("Invalid insight returned by the language model", 502, "INVALID_LLM_INSIGHT");
      }
      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to generate insights", 502, "LLM_INSIGHT_GENERATION_FAILED");
    }
  }
}
