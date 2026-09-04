import { type Request, type Response } from "express";
import { AgentService } from "./agent.service.js";
import type { AuthenticatedRequest } from "../../infrastructure/security/auth.middleware.js";

const agentService = new AgentService();

export async function executeAgentQuery(
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> {
  const { dataSourceId, question } = req.body as {
    dataSourceId?: unknown;
    question?: unknown;
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

  if (
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    res.status(400).json({
      error: "question is required",
    });
    return;
  }

  const result = await agentService.execute({
    dataSourceId: dataSourceId.trim() as string | "all",
    question: question.trim(),
  }, req.user.organizationId);

  res.status(200).json(result);
}