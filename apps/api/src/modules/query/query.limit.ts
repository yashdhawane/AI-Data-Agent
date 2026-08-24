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

  if (statements.length !== 1) {
    throw new AppError(
      "Multiple SQL statements are not allowed",
      400,
      "MULTIPLE_SQL_STATEMENTS",
    );
  }

  const statement = statements[0]?.stmt;

  if (
    !statement ||
    !("SelectStmt" in statement)
  ) {
    throw new AppError(
      "Only SELECT queries are allowed",
      400,
      "READ_ONLY_QUERY_REQUIRED",
    );
  }

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

  if (
    typeof existingLimitValue === "number" &&
    existingLimitValue <= MAX_ROWS
  ) {
    return sql.trim().replace(/;\s*$/, "");
  }

  selectStatement.limitCount = {
    A_Const: {
      ival: {
        ival: MAX_ROWS,
      },
    },
  };

  return (await deparse(parsed))
    .trim()
    .replace(/;\s*$/, "");
}