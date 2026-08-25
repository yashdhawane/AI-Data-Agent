import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { PostgresConnector } from "../../infrastructure/connectors/postgres.connector.js";
import { PostgresMetadataProvider } from "../../infrastructure/connectors/postgres.metadata.provider.js";
import { prisma } from "../../infrastructure/database/prisma.js";
import type { DatabaseMetadata } from "./metadata.types.js";

export class MetadataService {
  async getDatabaseMetadata(
    dataSourceId: string,
  ): Promise<DatabaseMetadata> {
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
      throw new Error(
        `Unsupported data source type: ${dataSource.type}`,
      );
    }

    const connectionUrl =
      await getDataSourceConnectionUrl(dataSource.id);

    const connector = new PostgresConnector(connectionUrl);

    const provider = new PostgresMetadataProvider(connector);

    try {
      return await provider.getMetadata();
    } finally {
      await connector.close();
    }
  }
}