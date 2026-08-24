import { prisma } from "../../infrastructure/database/prisma.js";

export class UserService {
  async create(
    email: string,
    name: string | undefined,
    organizationId: string,
  ) {
    return prisma.user.create({
      data: {
        email,
        name,
        organization: {
          connect: {
            id: organizationId,
          },
        },
      },
    });
  }
}
