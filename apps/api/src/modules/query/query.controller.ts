import { type Request, type Response } from "express";
import { QueryService } from "./query.service.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";

const queryService = new QueryService();

export async function executeQuery(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const { dataSourceId, sql } = req.body as {
    dataSourceId?: unknown;
    sql?: unknown;
  };

  if (
    typeof dataSourceId !== "string" ||
    dataSourceId.trim().length === 0
  ) {
    res.status(400).json({
      error: "dataSourceId is required",
    });
    return;
  }

  if (typeof sql !== "string" || sql.trim().length === 0) {
    res.status(400).json({
      error: "sql is required",
    });
    return;
  }

  const result = await queryService.execute({
    dataSourceId: dataSourceId.trim(),
    sql: sql.trim(),
  }, req.user.organizationId);

  res.status(200).json(result);
}