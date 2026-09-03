import { AppError } from "../../infrastructure/http/app-error.js";
import type { MongoQuery } from "./mongo-query.types.js";

const allowedOperators = new Set([
  "$and", "$or", "$not", "$eq", "$ne", "$gt", "$gte", "$lt", "$lte",
  "$in", "$nin", "$exists", "$regex",
]);

function validateValue(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(validateValue);
    return;
  }

  if (!value || typeof value !== "object") return;

  for (const [key, nestedValue] of Object.entries(value)) {
    if (key.startsWith("$") && !allowedOperators.has(key)) {
      throw new AppError(`MongoDB operator is not allowed: ${key}`, 400, "UNSAFE_MONGO_QUERY");
    }
    validateValue(nestedValue);
  }
}

export function validateMongoQuery(input: string): MongoQuery {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new AppError("Invalid MongoDB query JSON", 400, "INVALID_MONGO_QUERY");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new AppError("MongoDB query must be an object", 400, "INVALID_MONGO_QUERY");
  }

  const query = parsed as Record<string, unknown>;
  if (typeof query.collection !== "string" || !/^[A-Za-z0-9_.-]+$/.test(query.collection)) {
    throw new AppError("A valid MongoDB collection is required", 400, "INVALID_MONGO_QUERY");
  }
  if (!query.filter || typeof query.filter !== "object" || Array.isArray(query.filter)) {
    throw new AppError("MongoDB filter must be an object", 400, "INVALID_MONGO_QUERY");
  }

  const limit = query.limit;
  if (limit !== undefined && (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 100)) {
    throw new AppError("MongoDB query limit must be between 1 and 100", 400, "INVALID_MONGO_QUERY");
  }

  validateValue(query.filter);
  validateValue(query.projection);
  validateValue(query.sort);

  return {
    collection: query.collection,
    filter: query.filter as Record<string, unknown>,
    ...(query.projection ? { projection: query.projection as Record<string, 0 | 1> } : {}),
    ...(query.sort ? { sort: query.sort as Record<string, 1 | -1> } : {}),
    limit: typeof limit === "number" ? limit : 100,
  };
}