import { deparse, parse } from "pgsql-parser";
import { AppError } from "../../infrastructure/http/app-error.js";

const MAX_ROWS = 1000;

export async function applyQueryLimit(sql: string): Promise<string> {
  let parsed: Awaited<ReturnType<typeof parse>>;

  try {
    parsed = await parse(sql);
  } catch {
    throw new AppError(
      "Invalid SQL query",
      400,
      "INVALID_SQL",
    );
  }

  const statements = parsed.stmts ?? [];

  if (statements.length === 0) {
    throw new AppError(
      "A SQL query is required",
      400,
      "SQL_QUERY_REQUIRED",
    );
  }

  if (statements.some(({ stmt }) => !stmt || !("SelectStmt" in stmt))) {
    throw new AppError(
      "Only SELECT queries are allowed",
      400,
      "READ_ONLY_QUERY_REQUIRED",
    );
  }

  let changed = false;
  for (const parsedStatement of statements) {
    const statement = parsedStatement.stmt;
    if (!statement || !("SelectStmt" in statement)) continue;
    const selectStatement = statement.SelectStmt;

    const existingLimit =
      "limitCount" in selectStatement
        ? selectStatement.limitCount
        : undefined;

    const existingLimitValue =
      existingLimit &&
      "A_Const" in existingLimit &&
      existingLimit.A_Const &&
      "ival" in existingLimit.A_Const &&
      existingLimit.A_Const.ival &&
      "ival" in existingLimit.A_Const.ival
        ? existingLimit.A_Const.ival.ival
        : undefined;

    if (!(typeof existingLimitValue === "number" && existingLimitValue <= MAX_ROWS)) {
      selectStatement.limitCount = {
        A_Const: {
          ival: {
            ival: MAX_ROWS,
          },
        },
      };
      changed = true;
    }
  }

  if (!changed) return sql.trim().replace(/;\s*$/, "");

  return (await deparse(parsed))
    .trim()
    .replace(/;\s*$/, "");
}