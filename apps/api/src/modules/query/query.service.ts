import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { DatabaseConnectorFactory } from "../../infrastructure/connectors/database-connector.factory.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import { validateReadOnlySql } from "./query.validator.js";
import type {
  QueryRequest,
  QueryResult,
} from "./query.types.js";
import { applyQueryLimit } from "./query.limit.js";
import { validateMongoQuery } from "./mongo-query.validator.js";

export class QueryService {
  async execute(request: QueryRequest, organizationId: string): Promise<QueryResult> {
    const { dataSourceId, sql } = request;

    const dataSource = await prisma.dataSource.findUnique({
      where: {
        id: dataSourceId,
      },
      select: {
        id: true,
        type: true,
        organizationId: true,
      },
    });

    if (!dataSource || dataSource.organizationId !== organizationId) {
      throw new AppError(
        "Data source not found",
        404,
        "DATA_SOURCE_NOT_FOUND",
      );
    }

    if (dataSource.type === "mongodb") {
      const mongoQuery = validateMongoQuery(sql);
      const connectionUrl = await getDataSourceConnectionUrl(dataSource.id);
      const connector = DatabaseConnectorFactory.create(dataSource.type, connectionUrl);

      try {
        const rows = await connector.query(JSON.stringify(mongoQuery));
        return {
          columns: rows.length > 0 ? Object.keys(rows[0] ?? {}) : [],
          rows,
          rowCount: rows.length,
        };
      } finally {
        await connector.close();
      }
    }

    if (dataSource.type !== "postgresql") {
      throw new AppError(
        `Unsupported data source type: ${dataSource.type}`,
        400,
        "UNSUPPORTED_DATA_SOURCE",
      );
    }

    const validatedSql = validateReadOnlySql(sql);
    const safeSql = await applyQueryLimit(validatedSql);
    const connectionUrl =
      await getDataSourceConnectionUrl(dataSource.id);

    const connector = DatabaseConnectorFactory.create(dataSource.type, connectionUrl);

    try {
      const rows = await connector.query(
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