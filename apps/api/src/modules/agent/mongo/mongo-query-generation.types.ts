import type { MongoQuery } from "../../query/mongo-query.types.js";

export interface MongoQueryGenerationRequest {
  question: string;
  schema: string;
  businessContext?: string;
}

export type MongoQueryGenerationResponse = MongoQuery;