import { type Request, type Response } from "express";
import { OrganizationService } from "./organization.service.js";

const organizationService = new OrganizationService();

export async function createOrganization(
  req: Request,
  res: Response,
): Promise<void> {
  const { name } = req.body as { name?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: "Organization name is required",
    });
    return;
  }

  const organization = await organizationService.create(name.trim());

  res.status(201).json(organization);
}
