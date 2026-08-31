export interface AgentQueryRequest {
  dataSourceId: string;
  question: string;
}

export interface AgentQueryResponse {
  question: string;
  sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  insight: {
    summary: string;
    facts: string[];
    inferences: string[];
    recommendations: string[];
    unknowns: string[];
    confidence: "LOW" | "MEDIUM" | "HIGH";
  };
}