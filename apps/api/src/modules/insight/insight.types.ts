export type InsightResponse = {
  summary: string;
  facts: string[];
  inferences: string[];
  recommendations: string[];
  unknowns: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
};

export type InsightInput = {
  question: string;
  sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
  businessContext?: string;
};
