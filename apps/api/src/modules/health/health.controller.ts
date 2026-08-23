import { type Request, type Response } from "express";
import { HealthService } from "./health.service.js";

const healthService = new HealthService();

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json(healthService.getStatus());
}
