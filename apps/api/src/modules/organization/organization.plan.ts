import { AppError } from "../../infrastructure/http/app-error.js";
import { prisma } from "../../infrastructure/database/prisma.js";

export const PLAN_LIMITS = {
  SMALL: 1,
  MID_SCALE: Number.POSITIVE_INFINITY,
  ENTERPRISE: 0,
} as const;

export async function getOrganizationPlan(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
  }

  return organization;
}

export async function updateOrganizationPlan(
  organizationId: string,
  plan: "SMALL" | "MID_SCALE" | "ENTERPRISE",
) {
  if (plan === "ENTERPRISE") {
    throw new AppError("Enterprise access is not available yet", 403, "ENTERPRISE_PLAN_UNAVAILABLE");
  }

  return prisma.organization.update({
    where: { id: organizationId },
    data: { plan },
    select: { plan: true },
  });
}

export async function assertCanAddDataSource(organizationId: string): Promise<void> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { plan: true, _count: { select: { dataSources: true } } },
  });

  if (!organization) {
    throw new AppError("Organization not found", 404, "ORGANIZATION_NOT_FOUND");
  }

  const limit = PLAN_LIMITS[organization.plan];
  if (organization._count.dataSources >= limit) {
    const message = organization.plan === "SMALL"
      ? "The Small plan supports one database. Upgrade to Mid-scale to connect multiple databases."
      : "Enterprise access is not available yet.";
    throw new AppError(message, 403, "DATA_SOURCE_PLAN_LIMIT_REACHED");
  }
}