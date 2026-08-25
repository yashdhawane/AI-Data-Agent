import { AppError } from "../../infrastructure/http/app-error.js";

import { MetadataService } from "../metadata/metadata.service.js";
import { createLlmService } from "../llm/llm.factory.js";
import { QueryService } from "../query/query.service.js";

import { IntentService } from "./intent/intent.service.js";
import { SqlGenerationService } from "./sql/sql-generation.service.js";

import { MetadataContextBuilder } from "../metadata/context/metadata-context.builder.js";

import type {
  AgentQueryRequest,
  AgentQueryResponse,
} from "./agent.types.js";

export class AgentService {
  private readonly metadataService: MetadataService;
  private readonly llmService: ReturnType<typeof createLlmService>;
  private readonly queryService: QueryService;
  private readonly intentService: IntentService;
  private readonly sqlGenerationService: SqlGenerationService;
  private readonly metadataContextBuilder: MetadataContextBuilder;

  constructor() {
    this.metadataService = new MetadataService();
    this.metadataContextBuilder = new MetadataContextBuilder();
    this.llmService = createLlmService();
    this.queryService = new QueryService();
    this.sqlGenerationService = new SqlGenerationService(this.llmService);
    this.intentService = new IntentService(
      this.llmService,
    );
  }

  async execute(
    request: AgentQueryRequest,
  ): Promise<AgentQueryResponse> {
    const intent =
      await this.intentService.classify(
        request.question,
      );

    if (intent === "WRITE_OPERATION") {
      throw new AppError(
        "Only read-only data queries are supported",
        400,
        "READ_ONLY_OPERATION_REQUIRED",
      );
    }

    if (intent === "UNSUPPORTED") {
      throw new AppError(
        "This request is not supported by the data agent",
        400,
        "UNSUPPORTED_AGENT_REQUEST",
      );
    }

    const metadata =
      await this.metadataService.getDatabaseMetadata(
        request.dataSourceId,
      );

    const schema =
  this.metadataContextBuilder.build(metadata);

    const sql =
      await this.sqlGenerationService.generate({
        question: request.question,
        schema,
        intent
  });


    const result =
      await this.queryService.execute({
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