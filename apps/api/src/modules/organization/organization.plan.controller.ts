import type { Response } from "express";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";
import { getOrganizationPlan, updateOrganizationPlan } from "./organization.plan.js";

export async function getPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.status(200).json(await getOrganizationPlan(req.user.organizationId));
}

export async function updatePlan(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { plan } = req.body as { plan?: unknown };
  if (plan !== "SMALL" && plan !== "MID_SCALE" && plan !== "ENTERPRISE") {
    res.status(400).json({ error: "plan must be SMALL, MID_SCALE, or ENTERPRISE" });
    return;
  }

  res.status(200).json(await updateOrganizationPlan(req.user.organizationId, plan));
}