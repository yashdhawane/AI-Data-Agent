import { prisma } from "../../infrastructure/database/prisma.js";
import { hashPassword } from "../../infrastructure/security/jwt.js";

export class UserService {
  async list(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(
    email: string,
    password: string,
    name: string | undefined,
    organizationId: string,
  ) {
    const passwordHash = await hashPassword(password);
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "MEMBER",
        organization: {
          connect: {
            id: organizationId,
          },
        },
      },
    });
  }
}
