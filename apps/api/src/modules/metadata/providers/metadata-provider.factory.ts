import type { MetadataProvider } from "../metadata.provider.js";
import { PostgresMetadataProvider } from "../../../infrastructure/connectors/postgres.metadata.provider.js";
import type { PostgresConnector } from "../../../infrastructure/connectors/postgres.connector.js";
import { DataSourceType } from "../../../generated/prisma/enums.js";
import { MongoMetadataProvider } from "../../../infrastructure/connectors/mongo.metadata.provider.js";
import type { MongoConnector } from "../../../infrastructure/connectors/mongo.connector.js";

export type MetadataProviderDependencies = {
  postgresConnector?: PostgresConnector;
  mongoConnector?: MongoConnector;
};

export class MetadataProviderFactory {
  static create(
    type: DataSourceType,
    dependencies: MetadataProviderDependencies = {},
  ): MetadataProvider {
    switch (type) {
      case DataSourceType.postgresql: {
        if (!dependencies.postgresConnector) {
          throw new Error(
            "PostgreSQL connector is required",
          );
        }

        return new PostgresMetadataProvider(
          dependencies.postgresConnector,
        );
      }

      case DataSourceType.mongodb: {
        if (!dependencies.mongoConnector) {
          throw new Error("MongoDB connector is required");
        }
        return new MongoMetadataProvider(dependencies.mongoConnector);
      }

      default:
        throw new Error(
          `Unsupported data source type: ${type}`,
        );
    }
  }
}