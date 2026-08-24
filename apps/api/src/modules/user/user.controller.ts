import { type Request, type Response } from "express";
import { UserService } from "./user.service.js";

const userService = new UserService();

export async function createUser(
  req: Request,
  res: Response,
): Promise<void> {
  const { email, name, organizationId } = req.body as {
    email?: unknown;
    name?: unknown;
    organizationId?: unknown;
  };

  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    typeof organizationId !== "string" ||
    organizationId.trim().length === 0
  ) {
    res.status(400).json({
      error: "email and organizationId are required",
    });
    return;
  }

  const user = await userService.create(
    email.trim(),
    typeof name === "string" ? name.trim() : undefined,
    organizationId.trim(),
  );

  res.status(201).json(user);
}
