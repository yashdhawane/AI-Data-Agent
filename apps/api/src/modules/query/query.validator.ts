import { parseSync } from "pgsql-parser";
import { AppError } from "../../infrastructure/http/app-error.js";

interface ParsedStatement {
  stmt?: Record<string, unknown>;
}

interface ParsedQuery {
  stmts?: ParsedStatement[];
}

export function validateReadOnlySql(sql: string): string {
  const normalized = sql.trim();

  if (!normalized) {
    throw new AppError(
      "SQL query is required",
      400,
      "SQL_QUERY_REQUIRED",
    );
  }

  let parsed: ParsedQuery;

  try {
    parsed = parseSync(normalized) as ParsedQuery;
  } catch {
    throw new AppError(
      "Invalid SQL query",
      400,
      "INVALID_SQL",
    );
  }

  const statements = parsed.stmts ?? [];

  if (statements.length !== 1) {
    throw new AppError(
      "Multiple SQL statements are not allowed",
      400,
      "MULTIPLE_SQL_STATEMENTS",
    );
  }

  const statement = statements[0]?.stmt;

  if (!statement || !("SelectStmt" in statement)) {
    throw new AppError(
      "Only SELECT queries are allowed",
      400,
      "READ_ONLY_QUERY_REQUIRED",
    );
  }

  return normalized.replace(/;\s*$/, "");
}