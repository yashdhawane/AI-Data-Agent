import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { PostgresConnector } from "../../infrastructure/connectors/postgres.connector.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import { AppError } from "../../infrastructure/http/app-error.js";
import { error } from "console";

export class DataSourceConnectionService {
  async testConnection(dataSourceId: string): Promise<void> {
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
      throw new Error("Data source not found");
    }

    if (dataSource.type !== "postgresql") {
      throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }

    const connectionUrl =
      await getDataSourceConnectionUrl(dataSource.id);

    const connector = new PostgresConnector(connectionUrl);

    try {
        await connector.testConnection();
    } catch (error) {
      console.error("PostgreSQL connection error:", error);

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