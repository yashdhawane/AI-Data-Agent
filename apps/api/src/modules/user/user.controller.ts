import { type Request, type Response } from "express";
import { UserService } from "./user.service.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";

const userService = new UserService();

export async function listUsers(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  res.status(200).json(await userService.list(req.user.organizationId));
}

export async function createUser(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const { email, password, name } = req.body as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
  };

  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    throw new AppError("email and password are required; password must be at least 8 characters", 400, "INVALID_USER");
  }

  if (req.user.role !== "ADMIN") {
    throw new AppError("Only organization admins can add users", 403, "ADMIN_REQUIRED");
  }

  const user = await userService.create(
    email.trim(),
    password,
    typeof name === "string" ? name.trim() : undefined,
    req.user.organizationId,
  );

  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.status(201).json(safeUser);
}
