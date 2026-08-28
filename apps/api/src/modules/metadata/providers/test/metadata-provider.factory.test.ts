import { describe, expect, it } from "vitest";

import { DataSourceType } from "../../../../generated/prisma/enums.js";

import {
  MetadataProviderFactory,
} from "../metadata-provider.factory.js";

describe("MetadataProviderFactory", () => {
  it("creates a PostgreSQL metadata provider", () => {
    const fakeConnector = {} as any;

    const provider =
      MetadataProviderFactory.create(
        DataSourceType.postgresql,
        {
          postgresConnector: fakeConnector,
        },
      );

    expect(provider).toBeDefined();
    expect(provider.constructor.name).toBe(
      "PostgresMetadataProvider",
    );
  });

  it("throws when PostgreSQL connector is missing", () => {
    expect(() =>
      MetadataProviderFactory.create(
        DataSourceType.postgresql,
      ),
    ).toThrow(
      "PostgreSQL connector is required",
    );
  });

  it("creates a MongoDB metadata provider", () => {
    const provider = MetadataProviderFactory.create(
      DataSourceType.mongodb,
      { mongoConnector: {} as any },
    );

    expect(provider).toBeDefined();
    expect(provider.constructor.name).toBe("MongoMetadataProvider");
  });

  it("throws when MongoDB connector is missing", () => {
    expect(() => MetadataProviderFactory.create(DataSourceType.mongodb)).toThrow(
      "MongoDB connector is required",
    );
  });
});