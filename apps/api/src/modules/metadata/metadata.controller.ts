import { type Request, type Response } from "express";
import { MetadataService } from "./metadata.service.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";

const metadataService = new MetadataService();

export async function getDatabaseMetadata(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const { id } = req.params;

  if (typeof id !== "string" || id.trim().length === 0) {
    res.status(400).json({
      error: "Data source id is required",
    });
    return;
  }

  const metadata = await metadataService.getDatabaseMetadata(id, req.user.organizationId);

  res.status(200).json(metadata);
}