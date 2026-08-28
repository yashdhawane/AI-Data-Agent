import { describe, expect, it } from "vitest";
import { DataSourceType } from "../../../generated/prisma/enums.js";
import { DatabaseConnectorFactory } from "../database-connector.factory.js";
import { PostgresConnector } from "../postgres.connector.js";
import { MongoConnector } from "../mongo.connector.js";

describe("DatabaseConnectorFactory", () => {
  it("creates a PostgreSQL connector", () => {
    const connector = DatabaseConnectorFactory.create(
      DataSourceType.postgresql,
      "postgresql://localhost/app",
    );

    expect(connector).toBeInstanceOf(PostgresConnector);
    expect(connector.type).toBe(DataSourceType.postgresql);
  });

  it("creates a MongoDB connector", () => {
    const connector = DatabaseConnectorFactory.create(
      DataSourceType.mongodb,
      "mongodb://localhost/app",
    );

    expect(connector).toBeInstanceOf(MongoConnector);
    expect(connector.type).toBe(DataSourceType.mongodb);
  });
});