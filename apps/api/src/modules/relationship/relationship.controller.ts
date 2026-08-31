import type { Response } from "express";
import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";
import { createLlmService } from "../llm/llm.factory.js";
import { RelationshipService } from "./relationship.service.js";

const relationshipService = new RelationshipService(createLlmService());

export async function discoverRelationships(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { dataSourceIds } = req.body as { dataSourceIds?: unknown };
  if (!Array.isArray(dataSourceIds) || dataSourceIds.length < 2 || dataSourceIds.some((id) => typeof id !== "string" || !id.trim())) {
    throw new AppError("At least two dataSourceIds are required", 400, "INVALID_RELATIONSHIP_DISCOVERY_REQUEST");
  }
  res.status(201).json(await relationshipService.discover(dataSourceIds.map((id) => id.trim()), req.user.organizationId));
}

export async function listRelationships(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(200).json(await relationshipService.list(req.user.organizationId));
}

export async function updateRelationship(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  if (typeof id !== "string" || !id) throw new AppError("Relationship id is required", 400, "RELATIONSHIP_ID_REQUIRED");
  const body = req.body as Record<string, unknown>;
  const status = body.status;
  if (status !== undefined && status !== "ACCEPTED" && status !== "REJECTED" && status !== "DISCOVERED") {
    throw new AppError("Invalid relationship status", 400, "INVALID_RELATIONSHIP_STATUS");
  }
  const updated = await relationshipService.update(id, req.user.organizationId, {
    status,
    sourceEntity: typeof body.sourceEntity === "string" ? body.sourceEntity : undefined,
    sourceField: typeof body.sourceField === "string" ? body.sourceField : undefined,
    targetEntity: typeof body.targetEntity === "string" ? body.targetEntity : undefined,
    targetField: typeof body.targetField === "string" ? body.targetField : undefined,
  });
  res.status(200).json(updated);
}
