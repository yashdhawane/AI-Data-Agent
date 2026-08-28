import type { MetadataProvider } from "../../modules/metadata/metadata.provider.js";
import type { DatabaseMetadata } from "../../modules/metadata/metadata.types.js";
import type { MongoConnector } from "./mongo.connector.js";

export class MongoMetadataProvider implements MetadataProvider {
  constructor(private readonly connector: MongoConnector) {}

  async getMetadata(): Promise<DatabaseMetadata> {
    const collections = await this.connector.listCollections();
    return {
      databaseType: "mongodb",
      dataModel: "document",
      metadata: { collections },
    };
  }
}
