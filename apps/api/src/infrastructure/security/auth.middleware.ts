import type { NextFunction, Request, Response } from "express";
import { AppError } from "../http/app-error.js";
import { verifyJwt } from "./jwt.js";

export type AuthUser = {
  id: string;
  organizationId: string;
  email: string;
  role: "ADMIN" | "MEMBER";
};

export type AuthenticatedRequest = Request;

declare global {
  namespace Express {
    interface Request {
      user: AuthUser;
    }
  }
}

function tokenFromRequest(req: Request): string | undefined {
  const authorization = req.header("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  const cookie = req.header("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("access_token="));
  return cookie?.slice("access_token=".length);
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = tokenFromRequest(req);
  if (!token) return next(new AppError("Authentication required", 401, "AUTHENTICATION_REQUIRED"));

  try {
    const payload = verifyJwt(token);
    req.user = {
      id: payload.sub,
      organizationId: payload.organizationId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401, "INVALID_TOKEN"));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") {
    next(new AppError("Only organization admins can perform this action", 403, "ADMIN_REQUIRED"));
    return;
  }
  next();
}
