import type { Request, Response } from "express";
import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";
import { BusinessContextService } from "./business-context.service.js";

const businessContextService = new BusinessContextService();

export async function getBusinessContext(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(200).json(await businessContextService.get(req.user.organizationId));
}

export async function saveBusinessContext(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { content } = req.body as { content?: unknown };
  if (typeof content !== "string") {
    throw new AppError("Business context is required", 400, "BUSINESS_CONTEXT_REQUIRED");
  }

  res.status(200).json(await businessContextService.save(req.user.organizationId, content));
}
