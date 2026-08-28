import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import { createJwt, hashPassword, verifyPassword } from "../../infrastructure/security/jwt.js";

export type AuthResult = {
  token: string;
  user: { id: string; email: string; name: string | null; organizationId: string; role: "ADMIN" | "MEMBER" };
};

export class AuthService {
  async register(input: { email: string; password: string; name?: string; organizationName: string }): Promise<AuthResult> {
    if (input.password.length < 8) throw new AppError("Password must be at least 8 characters", 400, "WEAK_PASSWORD");
    const email = input.email.toLowerCase();
    const organizationName = input.organizationName.trim();
    const normalizedName = organizationName.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("Email is already registered", 409, "EMAIL_ALREADY_REGISTERED");
    const existingOrganization = await prisma.organization.findUnique({ where: { normalizedName } });
    if (existingOrganization) throw new AppError("Organization name is already registered", 409, "ORGANIZATION_ALREADY_EXISTS");

    const passwordHash = await hashPassword(input.password);
    try {
      const user = await prisma.$transaction(async (transaction) => {
        const organization = await transaction.organization.create({ data: { name: organizationName, normalizedName } });
        return transaction.user.create({
          data: { email, passwordHash, name: input.name, role: "ADMIN", organizationId: organization.id },
        });
      });

      return this.result(user);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new AppError("Organization name or email is already registered", 409, "REGISTRATION_CONFLICT");
      }
      throw error;
    }
  }

  async login(emailInput: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: emailInput.toLowerCase() } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }
    return this.result(user);
  }

  private result(user: { id: string; email: string; name: string | null; organizationId: string; role: "ADMIN" | "MEMBER" }): AuthResult {
    return {
      token: createJwt({ sub: user.id, organizationId: user.organizationId, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, name: user.name, organizationId: user.organizationId, role: user.role },
    };
  }
}
