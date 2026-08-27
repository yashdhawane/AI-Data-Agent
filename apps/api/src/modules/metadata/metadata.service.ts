import { getDataSourceConnectionUrl } from "../../infrastructure/database/data-source-credentials.js";
import { PostgresConnector } from "../../infrastructure/connectors/postgres.connector.js";
import { prisma } from "../../infrastructure/database/prisma.js";

import { MetadataProviderFactory } from "./providers/metadata-provider.factory.js";

import type { DatabaseMetadata } from "./metadata.types.js";

export class MetadataService {
  async getDatabaseMetadata(
    dataSourceId: string,
  ): Promise<DatabaseMetadata> {
    const dataSource =
      await prisma.dataSource.findUnique({
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

    const connectionUrl =
      await getDataSourceConnectionUrl(
        dataSource.id,
      );

    if (dataSource.type === "postgresql") {
      const connector =
        new PostgresConnector(connectionUrl);

      try {
        const provider =
          MetadataProviderFactory.create(
            dataSource.type,
            {
              postgresConnector: connector,
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