import type { AgentIntent } from "../intent/intent.types.js";

export interface SqlGenerationRequest {
  question: string;
  schema: string;
  intent: AgentIntent;
}

export interface SqlGenerationResponse {
  sql: string;
}