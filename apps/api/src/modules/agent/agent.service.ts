import { AppError } from "../../infrastructure/http/app-error.js";
import { prisma } from "../../infrastructure/database/prisma.js";

import { MetadataService } from "../metadata/metadata.service.js";
import { createLlmService } from "../llm/llm.factory.js";
import { QueryService } from "../query/query.service.js";

import { IntentService } from "./intent/intent.service.js";
import { SqlGenerationService } from "./sql/sql-generation.service.js";

import { MetadataContextBuilder } from "../metadata/context/metadata-context.builder.js";
import { BusinessContextService } from "../business-context/business-context.service.js";
import { InsightService } from "../insight/insight.service.js";
import { MongoQueryGenerationService } from "./mongo/mongo-query-generation.service.js";
import type { QueryResult } from "../query/query.types.js";

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
  private readonly businessContextService: BusinessContextService;
  private readonly insightService: InsightService;
  private readonly mongoQueryGenerationService: MongoQueryGenerationService;

  constructor() {
    this.metadataService = new MetadataService();
    this.metadataContextBuilder = new MetadataContextBuilder();
    this.businessContextService = new BusinessContextService();
    this.llmService = createLlmService();
    this.insightService = new InsightService(this.llmService);
    this.mongoQueryGenerationService = new MongoQueryGenerationService(this.llmService);
    this.queryService = new QueryService();
    this.sqlGenerationService = new SqlGenerationService(this.llmService);
    this.intentService = new IntentService(
      this.llmService,
    );
  }

  async execute(
    request: AgentQueryRequest,
    organizationId: string,
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

    if (request.dataSourceId === "all") {
      return this.executeAll(request.question, organizationId, intent);
    }

    const metadata =
      await this.metadataService.getDatabaseMetadata(
        request.dataSourceId,
        organizationId,
      );

    const schema =
  this.metadataContextBuilder.build(metadata);
    const businessContext = await this.businessContextService.get(organizationId);

    const sql = metadata.dataModel === "document"
      ? await this.mongoQueryGenerationService.generate({
          question: request.question,
          schema,
          businessContext: businessContext?.content,
        })
      : await this.sqlGenerationService.generate({
          question: request.question,
          schema,
          businessContext: businessContext?.content,
          intent,
        });


    const result =
      await this.queryService.execute({
        dataSourceId: request.dataSourceId,
        sql,
      }, organizationId);
    const insight = await this.insightService.generate({
      question: request.question,
      sql,
      ...result,
      businessContext: businessContext?.content,
    });

    return {
      question: request.question,
      sql,
      ...result,
      insight,
    };
  }

  private async executeAll(question: string, organizationId: string, intent: "READ_QUERY"): Promise<AgentQueryResponse> {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true },
    });
    if (organization?.plan !== "MID_SCALE") {
      throw new AppError("All data sources requires the Mid-scale plan", 403, "MULTI_SOURCE_PLAN_REQUIRED");
    }

    const sources = await this.getOrganizationSources(organizationId);
    if (sources.length === 0) {
      throw new AppError("No data sources are connected", 400, "NO_DATA_SOURCES_CONNECTED");
    }

    const results = await Promise.all(sources.map(async (source) => {
      const result = await this.executeSource(source.id, question, organizationId, intent);
      return {
        source: source.name,
        type: source.type,
        result,
      };
    }));
    const rows = results.flatMap(({ source, type, result }) =>
      result.rows.map((row) => ({ _source: source, _sourceType: type, ...row })),
    );
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    const sql = JSON.stringify(Object.fromEntries(results.map(({ source, type, result }) => [
      `${source} (${type})`, result.sql,
    ])));
    const businessContext = await this.businessContextService.get(organizationId);
    const insight = await this.insightService.generate({
      question,
      sql,
      columns,
      rows,
      businessContext: businessContext?.content,
    });

    return { question, sql, columns, rows, rowCount: rows.length, insight };
  }

  private async executeSource(
    dataSourceId: string,
    question: string,
    organizationId: string,
    intent: "READ_QUERY",
  ): Promise<{ sql: string } & QueryResult> {
    const metadata = await this.metadataService.getDatabaseMetadata(dataSourceId, organizationId);
    const schema = this.metadataContextBuilder.build(metadata);
    const businessContext = await this.businessContextService.get(organizationId);
    const sql = metadata.dataModel === "document"
      ? await this.mongoQueryGenerationService.generate({ question, schema, businessContext: businessContext?.content })
      : await this.sqlGenerationService.generate({ question, schema, businessContext: businessContext?.content, intent });
    const result = await this.queryService.execute({ dataSourceId, sql }, organizationId);
    return { sql, ...result };
  }

  private getOrganizationSources(organizationId: string) {
    return prisma.dataSource.findMany({
      where: { organizationId },
      select: { id: true, name: true, type: true },
    });
  }
}