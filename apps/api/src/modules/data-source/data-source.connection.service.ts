import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { DatabaseConnectorFactory } from "../../infrastructure/connectors/database-connector.factory.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";

export class DataSourceConnectionService {
  async testConnection(dataSourceId: string, organizationId: string): Promise<void> {
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
      throw new AppError("Data source not found", 404, "DATA_SOURCE_NOT_FOUND");
    }

    if (dataSource.type !== "postgresql") {
      throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }

    const connectionUrl =
      await getDataSourceConnectionUrl(dataSource.id);

    const connector = DatabaseConnectorFactory.create(dataSource.type, connectionUrl);

    try {
        await connector.testConnection();
    } catch (error) {
      console.error("PostgreSQL connection error:", error);

      if (error && typeof error === "object" && "code" in error && error.code === "3D000") {
        throw new AppError(
          "The PostgreSQL database does not exist. Check the database name in the connection URL.",
          400,
          "POSTGRES_DATABASE_NOT_FOUND",
        );
      }

      if (error && typeof error === "object" && "code" in error && error.code === "ECONNREFUSED") {
        throw new AppError(
          "Could not reach PostgreSQL. Check the host and mapped port in the connection URL.",
          400,
          "POSTGRES_CONNECTION_REFUSED",
        );
      }

      if (error && typeof error === "object" && "code" in error && error.code === "28P01") {
        throw new AppError(
          "PostgreSQL rejected the credentials. Check the username and password in the connection URL.",
          400,
          "POSTGRES_INVALID_CREDENTIALS",
        );
      }

            throw new AppError(
                "Data source connection failed",
                502,
                "DATA_SOURCE_CONNECTION_FAILED",
            );
        } finally {
            await connector.close();
    }
  }
}