import { AppError } from "../../../infrastructure/http/app-error.js";
import type { LlmService } from "../../llm/llm.service.js";
import { validateMongoQuery } from "../../query/mongo-query.validator.js";
import type {
  MongoQueryGenerationRequest,
  MongoQueryGenerationResponse,
} from "./mongo-query-generation.types.js";

export class MongoQueryGenerationService {
  constructor(private readonly llmService: LlmService) {}

  async generate(request: MongoQueryGenerationRequest): Promise<string> {
    const response = await this.llmService.generateStructured<MongoQueryGenerationResponse>({
      systemPrompt: `
You are a MongoDB read-only query generation assistant.

Convert the user's natural-language question into exactly one safe MongoDB find query.
Return a JSON object with collection, filter, optional projection, optional sort, and limit.

Rules:
- Use only collections and fields present in the provided schema.
- Never use aggregation, updates, deletes, inserts, mapReduce, JavaScript, or arbitrary operators.
- Use only simple find filters and the allowed comparison operators.
- Limit results to at most 100 documents.
- Return JSON only.

Database schema:
${request.schema}

Business context and organization rules:
${request.businessContext ?? "No business context has been configured."}
      `.trim(),
      userPrompt: request.question,
      responseSchema: {
        type: "object",
        properties: {
          collection: { type: "string" },
          filter: { type: "object" },
          projection: { type: "object" },
          sort: { type: "object" },
          limit: { type: "number" },
        },
        required: ["collection", "filter"],
      },
    });

    try {
      return JSON.stringify(validateMongoQuery(JSON.stringify(response)));
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("LLM returned an invalid MongoDB query", 502, "INVALID_GENERATED_MONGO_QUERY");
    }
  }
}