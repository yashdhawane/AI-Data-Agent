import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { PostgresConnector } from "../../infrastructure/connectors/postgres.connector.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import { validateReadOnlySql } from "./query.validator.js";
import type {
  QueryRequest,
  QueryResult,
} from "./query.types.js";
import { applyQueryLimit } from "./query.limit.js";

export class QueryService {
  async execute(request: QueryRequest): Promise<QueryResult> {
    const { dataSourceId, sql } = request;

    const validatedSql = validateReadOnlySql(sql);
    const safeSql = await applyQueryLimit(validatedSql);

    const dataSource = await prisma.dataSource.findUnique({
      where: {
        id: dataSourceId,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!dataSource) {
      throw new AppError(
        "Data source not found",
        404,
        "DATA_SOURCE_NOT_FOUND",
      );
    }

    if (dataSource.type !== "postgresql") {
      throw new AppError(
        `Unsupported data source type: ${dataSource.type}`,
        400,
        "UNSUPPORTED_DATA_SOURCE",
      );
    }

    const connectionUrl =
      await getDataSourceConnectionUrl(dataSource.id);

    const connector = new PostgresConnector(connectionUrl);

    try {
      const rows = await connector.query<Record<string, unknown>>(
        safeSql ,
      );

      return {
        columns: rows.length > 0 ? Object.keys(rows[0] ?? {}) : [],
        rows,
        rowCount: rows.length,
      };
    } finally {
      await connector.close();
    }
  }
}