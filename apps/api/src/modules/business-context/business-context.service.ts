import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";

export class BusinessContextService {
  get(organizationId: string) {
    return prisma.businessContext.findUnique({
      where: { organizationId },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });
  }

  async save(organizationId: string, content: string) {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      throw new AppError("Business context cannot be empty", 400, "BUSINESS_CONTEXT_REQUIRED");
    }

    return prisma.businessContext.upsert({
      where: { organizationId },
      create: { organizationId, content: normalizedContent },
      update: { content: normalizedContent },
      select: { id: true, content: true, createdAt: true, updatedAt: true },
    });
  }
}
