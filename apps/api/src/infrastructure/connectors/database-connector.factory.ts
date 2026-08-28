import { DataSourceType } from "../../generated/prisma/enums.js";
import { AppError } from "../http/app-error.js";
import type { DatabaseConnector } from "./database.connector.js";
import { PostgresConnector } from "./postgres.connector.js";
import { MongoConnector } from "./mongo.connector.js";

export class DatabaseConnectorFactory {
  static create(type: DataSourceType, connectionUrl: string): DatabaseConnector {
    switch (type) {
      case DataSourceType.postgresql:
        return new PostgresConnector(connectionUrl);
      case DataSourceType.mongodb:
        return new MongoConnector(connectionUrl);
      default:
        throw new AppError(`Unsupported data source type: ${type}`, 400, "UNSUPPORTED_DATA_SOURCE");
    }
  }
}