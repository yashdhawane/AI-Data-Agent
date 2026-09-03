import { MongoClient } from "mongodb";
import type { DatabaseConnector, DatabaseQueryResult } from "./database.connector.js";
import type { MongoQuery } from "../../modules/query/mongo-query.types.js";

export type MongoCollectionInfo = {
  name: string;
  documentCount: number;
  fields: { name: string; dataTypes: string[]; nullable: boolean }[];
};

export class MongoConnector implements DatabaseConnector {
  readonly type = "mongodb" as const;
  private readonly client: MongoClient;
  private readonly databaseName: string;

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString, { serverSelectionTimeoutMS: 5000 });
    const url = new URL(connectionString);
    this.databaseName = url.pathname.replace(/^\//, "");
    if (!this.databaseName) throw new Error("MongoDB connection URL must include a database name");
  }

  private database() {
    return this.client.db(this.databaseName);
  }

  async testConnection(): Promise<void> {
    await this.client.connect();
    await this.database().command({ ping: 1 });
  }

  async listCollections(): Promise<MongoCollectionInfo[]> {
    await this.client.connect();
    const collections = await this.database().listCollections().toArray();
    return Promise.all(collections.map(async ({ name }) => {
      const collection = this.database().collection(name);
      const documents = await collection.find({}).limit(100).toArray();
      const fields = new Map<string, Set<string>>();
      for (const document of documents) {
        for (const [field, value] of Object.entries(document)) {
          const types = fields.get(field) ?? new Set<string>();
          types.add(this.valueType(value));
          fields.set(field, types);
        }
      }
      return {
        name,
        documentCount: await collection.estimatedDocumentCount(),
        fields: Array.from(fields.entries()).map(([field, types]) => ({
          name: field,
          dataTypes: Array.from(types).sort(),
          nullable: documents.some((document) => !(field in document)),
        })),
      };
    }));
  }

  async query(query: string, _params: unknown[] = []): Promise<DatabaseQueryResult[]> {
    const mongoQuery = JSON.parse(query) as MongoQuery;
    await this.client.connect();

    const cursor = this.database()
      .collection(mongoQuery.collection)
      .find(mongoQuery.filter)
      .limit(mongoQuery.limit ?? 100);

    if (mongoQuery.projection) cursor.project(mongoQuery.projection);
    if (mongoQuery.sort) cursor.sort(mongoQuery.sort);

    return cursor.toArray() as Promise<DatabaseQueryResult[]>;
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  private valueType(value: unknown): string {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    if (value instanceof Date) return "date";
    if (typeof value === "object") return "object";
    return typeof value;
  }
}
