import { prisma } from "../../infrastructure/database/prisma.js";

export class OrganizationService {
  async create(name: string) {
    return prisma.organization.create({
      data: {
        name,
      },
    });
  }
}
