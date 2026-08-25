import { MetadataService } from "../metadata/metadata.service.js";
import { createLlmService } from "../llm/llm.factory.js";
import { QueryService } from "../query/query.service.js";

import type {
  AgentQueryRequest,
  AgentQueryResponse,
} from "./agent.types.js";

export class AgentService {
  constructor(
    private readonly metadataService = new MetadataService(),
    private readonly llmService = createLlmService(),
    private readonly queryService = new QueryService(),
  ) {}

  async execute(
    request: AgentQueryRequest,
  ): Promise<AgentQueryResponse> {
    const metadata =
      await this.metadataService.getDatabaseMetadata(
        request.dataSourceId,
      );

    const schema = JSON.stringify(metadata, null, 2);

    const response = await this.llmService.generate({
      systemPrompt: `
You are a PostgreSQL SQL generation assistant.

Your job is to convert a user's natural-language question
into ONE PostgreSQL SELECT query.

Rules:
- Return ONLY SQL.
- Generate exactly one SELECT statement.
- Never generate INSERT, UPDATE, DELETE, DROP, ALTER, CREATE,
  TRUNCATE, GRANT, REVOKE, or other write operations.
- Only use tables and columns present in the provided schema.
- Do not invent tables or columns.
- Do not include markdown fences.
- Do not include explanations.

Database schema:
${schema}
      `.trim(),

      userPrompt: request.question,
    });

    const sql = response.content
      .trim()
      .replace(/^```sql\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result = await this.queryService.execute({
      dataSourceId: request.dataSourceId,
      sql,
    });

    return {
      question: request.question,
      sql,
      ...result,
    };
  }
}