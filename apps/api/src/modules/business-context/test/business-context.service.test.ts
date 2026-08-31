import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { businessContext: { findUnique: vi.fn(), upsert: vi.fn() } },
}));

vi.mock("../../../infrastructure/database/prisma.js", () => ({ prisma: prismaMock }));

import { BusinessContextService } from "../business-context.service.js";

describe("BusinessContextService", () => {
  const service = new BusinessContextService();

  beforeEach(() => vi.clearAllMocks());

  it("loads context for an organization", async () => {
    prismaMock.businessContext.findUnique.mockResolvedValue({ id: "ctx-1", content: "Revenue excludes refunds" });
    await expect(service.get("org-1")).resolves.toEqual({ id: "ctx-1", content: "Revenue excludes refunds" });
    expect(prismaMock.businessContext.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org-1" } }));
  });

  it("upserts trimmed context", async () => {
    prismaMock.businessContext.upsert.mockResolvedValue({ id: "ctx-1", content: "Revenue excludes refunds" });
    await service.save("org-1", "  Revenue excludes refunds  ");
    expect(prismaMock.businessContext.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { organizationId: "org-1" },
      create: { organizationId: "org-1", content: "Revenue excludes refunds" },
      update: { content: "Revenue excludes refunds" },
    }));
  });

  it("rejects empty context", async () => {
    await expect(service.save("org-1", "   ")).rejects.toMatchObject({ code: "BUSINESS_CONTEXT_REQUIRED" });
  });
});