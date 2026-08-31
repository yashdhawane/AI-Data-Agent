import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import type { LlmService } from "../llm/llm.service.js";
import type { DatabaseMetadata } from "../metadata/metadata.types.js";
import { MetadataService } from "../metadata/metadata.service.js";

export type RelationshipCandidate = {
  sourceDataSourceId: string;
  sourceEntity: string;
  sourceField: string;
  targetDataSourceId: string;
  targetEntity: string;
  targetField: string;
  confidence: number;
  rationale: string;
};

function isCandidate(value: unknown): value is RelationshipCandidate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["sourceDataSourceId", "sourceEntity", "sourceField", "targetDataSourceId", "targetEntity", "targetField", "rationale"]
    .every((key) => typeof candidate[key] === "string" && candidate[key]);
}

export class RelationshipService {
  constructor(
    private readonly llmService: LlmService,
    private readonly metadataService = new MetadataService(),
  ) {}

  async discover(dataSourceIds: string[], organizationId: string) {
    const uniqueIds = [...new Set(dataSourceIds)];
    if (uniqueIds.length < 2) {
      throw new AppError("At least two data sources are required", 400, "MULTIPLE_DATA_SOURCES_REQUIRED");
    }

    const sources = await prisma.dataSource.findMany({
      where: { id: { in: uniqueIds }, organizationId },
      select: { id: true, name: true, type: true },
    });
    if (sources.length !== uniqueIds.length) {
      throw new AppError("One or more data sources were not found", 404, "DATA_SOURCE_NOT_FOUND");
    }

    const metadataEntries = await Promise.all(uniqueIds.map(async (id) => ({
      dataSourceId: id,
      metadata: await this.metadataService.getDatabaseMetadata(id, organizationId),
    })));

    let response: { relationships?: unknown };
    try {
      response = await this.llmService.generateStructured<{ relationships?: unknown }>({
        systemPrompt: `You identify possible relationships between metadata from different databases. Return only relationship candidates. Never claim certainty. Compare field names, types, and entity meaning. Candidates must connect different data sources. Confidence must be a number from 0 to 1. Explain the evidence in rationale. Return an empty relationships array when no plausible relationship exists.`,
        userPrompt: JSON.stringify(metadataEntries),
        responseSchema: {
          type: "object",
          properties: {
            relationships: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sourceDataSourceId: { type: "string" }, sourceEntity: { type: "string" }, sourceField: { type: "string" },
                  targetDataSourceId: { type: "string" }, targetEntity: { type: "string" }, targetField: { type: "string" },
                  confidence: { type: "number" }, rationale: { type: "string" },
                },
                required: ["sourceDataSourceId", "sourceEntity", "sourceField", "targetDataSourceId", "targetEntity", "targetField", "confidence", "rationale"],
              },
            },
          },
          required: ["relationships"],
        },
      });
    } catch {
      throw new AppError("Failed to discover cross-source relationships", 502, "RELATIONSHIP_DISCOVERY_FAILED");
    }

    const candidates = Array.isArray(response.relationships) ? response.relationships.filter(isCandidate) : [];
    const validSourceIds = new Set(uniqueIds);
    const safeCandidates = candidates.filter((candidate) =>
      validSourceIds.has(candidate.sourceDataSourceId) &&
      validSourceIds.has(candidate.targetDataSourceId) &&
      candidate.sourceDataSourceId !== candidate.targetDataSourceId &&
      Number.isFinite(candidate.confidence),
    ).map((candidate) => ({ ...candidate, confidence: Math.max(0, Math.min(1, candidate.confidence)) }));

    await prisma.dataRelationship.deleteMany({ where: { organizationId, status: "DISCOVERED" } });
    if (safeCandidates.length === 0) return [];

    return prisma.$transaction(safeCandidates.map((candidate) => prisma.dataRelationship.create({
      data: { ...candidate, organizationId, status: "DISCOVERED" },
    })));
  }

  list(organizationId: string) {
    return prisma.dataRelationship.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, organizationId: string, input: Partial<Pick<RelationshipCandidate, "sourceEntity" | "sourceField" | "targetEntity" | "targetField">> & { status?: "ACCEPTED" | "REJECTED" | "DISCOVERED" }) {
    const existing = await prisma.dataRelationship.findFirst({ where: { id, organizationId } });
    if (!existing) throw new AppError("Relationship not found", 404, "RELATIONSHIP_NOT_FOUND");
    return prisma.dataRelationship.update({ where: { id }, data: input });
  }
}
