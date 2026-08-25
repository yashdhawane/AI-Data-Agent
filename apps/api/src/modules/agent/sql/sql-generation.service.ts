import { AppError } from "../../../infrastructure/http/app-error.js";
import type { LlmService } from "../../llm/llm.service.js";

import type {
  SqlGenerationRequest,
  SqlGenerationResponse,
} from "./sql-generation.types.js";

export class SqlGenerationService {
  constructor(
    private readonly llmService: LlmService,
  ) {}

  async generate(
    request: SqlGenerationRequest,
  ): Promise<string> {
    if (request.intent !== "READ_QUERY") {
        throw new AppError(
            "SQL generation is only allowed for read queries",
            400,
            "SQL_GENERATION_NOT_ALLOWED",
        );
    }
    const response =
      await this.llmService.generateStructured<SqlGenerationResponse>({
        systemPrompt: `
You are a PostgreSQL SQL generation assistant.

Convert the user's natural-language question into exactly
one PostgreSQL SELECT query.

The request has already been classified as a READ_QUERY.

Generate SQL only for this read request.

Rules:
- Generate ONLY a SELECT query.
- Never generate INSERT, UPDATE, DELETE, DROP, ALTER,
  CREATE, TRUNCATE, GRANT, REVOKE, or any other write operation.
- Only use tables and columns present in the provided schema.
- Never invent tables or columns.
- Do not explain the query.
- Do not use markdown.
- Return the SQL in the "sql" field.

Database schema:
${request.schema}
        `.trim(),

        userPrompt: request.question,

        responseSchema: {
          type: "object",
          properties: {
            sql: {
              type: "string",
            },
          },
          required: ["sql"],
        },
      });

    if (
      typeof response.sql !== "string" ||
      response.sql.trim().length === 0
    ) {
      throw new AppError(
        "LLM returned an empty SQL query",
        502,
        "EMPTY_GENERATED_SQL",
      );
    }

    return response.sql.trim();
  }
}