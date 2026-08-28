import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { DatabaseConnectorFactory } from "../../infrastructure/connectors/database-connector.factory.js";
import { PostgresConnector } from "../../infrastructure/connectors/postgres.connector.js";
import { MongoConnector } from "../../infrastructure/connectors/mongo.connector.js";
import { prisma } from "../../infrastructure/database/prisma.js";

import { MetadataProviderFactory } from "./providers/metadata-provider.factory.js";

import type { DatabaseMetadata } from "./metadata.types.js";

export class MetadataService {
  async getDatabaseMetadata(
    dataSourceId: string,
    organizationId: string,
  ): Promise<DatabaseMetadata> {
    const dataSource =
      await prisma.dataSource.findUnique({
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
      throw new Error("Data source not found");
    }

    const connectionUrl =
      await getDataSourceConnectionUrl(
        dataSource.id,
      );

    if (dataSource.type === "postgresql" || dataSource.type === "mongodb") {
      const connector = DatabaseConnectorFactory.create(dataSource.type, connectionUrl);

      try {
        const provider =
          MetadataProviderFactory.create(
            dataSource.type,
            {
              ...(connector instanceof PostgresConnector ? { postgresConnector: connector } : {}),
              ...(connector instanceof MongoConnector ? { mongoConnector: connector } : {}),
            },
          );

        return await provider.getMetadata();
      } finally {
        await connector.close();
      }
    }

    throw new Error(
      `Unsupported data source type: ${dataSource.type}`,
    );
  }
}