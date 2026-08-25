import { type Request, type Response } from "express";
import { AgentService } from "./agent.service.js";

const agentService = new AgentService();

export async function executeAgentQuery(
  req: Request,
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
    dataSourceId: dataSourceId.trim(),
    question: question.trim(),
  });

  res.status(200).json(result);
}