import type { Request, Response } from "express";
import { AppError } from "../../infrastructure/http/app-error.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();
const cookieOptions = "HttpOnly; Path=/; SameSite=Lax; Max-Age=86400";

function requiredString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name, organizationName } = req.body as Record<string, unknown>;
  if (!requiredString(email) || !requiredString(password) || !requiredString(organizationName)) {
    throw new AppError("email, password and organizationName are required", 400, "INVALID_REGISTRATION");
  }
  const result = await authService.register({ email: email.trim(), password, name: requiredString(name) ? name.trim() : undefined, organizationName: organizationName.trim() });
  res.setHeader("Set-Cookie", `access_token=${result.token}; ${cookieOptions}`);
  res.status(201).json({ user: result.user });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as Record<string, unknown>;
  if (!requiredString(email) || !requiredString(password)) {
    throw new AppError("email and password are required", 400, "INVALID_LOGIN");
  }
  const result = await authService.login(email.trim(), password);
  res.setHeader("Set-Cookie", `access_token=${result.token}; ${cookieOptions}`);
  res.status(200).json({ user: result.user });
}

export function logout(_req: Request, res: Response): void {
  res.setHeader("Set-Cookie", "access_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
  res.status(204).send();
}

export function me(req: AuthenticatedRequest, res: Response): void {
  res.status(200).json({ user: req.user });
}
