export type AgentIntent =
  | "READ_QUERY"
  | "WRITE_OPERATION"
  | "UNSUPPORTED";

export interface IntentClassification {
  intent: AgentIntent;
}