import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    dataSource: {
      create: vi.fn(),
    },
  },
}));

vi.mock(
  "../../../infrastructure/database/prisma.js",
  () => ({
    prisma: prismaMock,
  }),
);

vi.mock(
  "../../../infrastructure/security/encryption.js",
  () => ({
    encrypt: vi.fn((value: string) => `encrypted:${value}`),
  }),
);

vi.mock(
  "../../../infrastructure/connectors/postgres.connector.js",
  () => ({
    PostgresConnector: class {
      testConnection = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
    },
  }),
);

vi.mock(
  "../../../infrastructure/connectors/database-connector.factory.js",
  () => ({
    DatabaseConnectorFactory: {
      create: vi.fn(() => ({
        testConnection: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      })),
    },
  }),
);

import { DataSourceService } from "../data-source.service.js";

describe("DataSourceService", () => {
  const service = new DataSourceService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a PostgreSQL data source", async () => {
    prismaMock.dataSource.create.mockResolvedValue({
      id: "ds-1",
      name: "Customer DB",
      type: "postgresql",
      connectionUrl: "encrypted:postgres://example",
      organizationId: "org-1",
    });

    const result = await service.create(
      "Customer DB",
      "postgresql",
      "postgres://example",
      "org-1",
    );

    expect(result.type).toBe("postgresql");

    expect(prismaMock.dataSource.create).toHaveBeenCalledWith({
      data: {
        name: "Customer DB",
        type: "postgresql",
        connectionUrl: "encrypted:postgres://example",
        organization: {
          connect: {
            id: "org-1",
          },
        },
      },
    });
  });

  it("creates a MongoDB data source", async () => {
    prismaMock.dataSource.create.mockResolvedValue({
      id: "ds-2",
      name: "Analytics DB",
      type: "mongodb",
      connectionUrl: "encrypted:mongodb://example",
      organizationId: "org-1",
    });

    const result = await service.create(
      "Analytics DB",
      "mongodb",
      "mongodb://example",
      "org-1",
    );

    expect(result.type).toBe("mongodb");

    expect(prismaMock.dataSource.create).toHaveBeenCalledWith({
      data: {
        name: "Analytics DB",
        type: "mongodb",
        connectionUrl: "encrypted:mongodb://example",
        organization: {
          connect: {
            id: "org-1",
          },
        },
      },
    });
  });

  it("encrypts the connection URL before saving", async () => {
    prismaMock.dataSource.create.mockResolvedValue({
      id: "ds-3",
      name: "Test DB",
      type: "postgresql",
      connectionUrl: "encrypted:secret",
      organizationId: "org-1",
    });

    await service.create(
      "Test DB",
      "postgresql",
      "secret",
      "org-1",
    );

    expect(
      prismaMock.dataSource.create,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          connectionUrl: "encrypted:secret",
        }),
      }),
    );
  });
});