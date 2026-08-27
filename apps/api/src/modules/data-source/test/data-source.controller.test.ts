import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("../data-source.service.js", () => ({
  DataSourceService: class {
    create = createMock;
  },
}));

import {
  createDataSource,
} from "../data-source.controller.js";

function createMockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };

  res.status.mockReturnValue(res);
  return res;
}

describe("createDataSource controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    createMock.mockResolvedValue({
      id: "ds-1",
      name: "Customer DB",
      type: "postgresql",
      connectionUrl: "encrypted-value",
      organizationId: "org-1",
    });
  });

  it("accepts PostgreSQL data source", async () => {
    const req = {
      body: {
        name: "Customer DB",
        type: "postgresql",
        connectionUrl: "postgres://example",
        organizationId: "org-1",
      },
    } as any;

    const res = createMockResponse();

    await createDataSource(req, res as any);

    expect(createMock).toHaveBeenCalledWith(
      "Customer DB",
      "postgresql",
      "postgres://example",
      "org-1",
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("accepts MongoDB data source", async () => {
    const req = {
      body: {
        name: "Analytics DB",
        type: "mongodb",
        connectionUrl: "mongodb://example",
        organizationId: "org-1",
      },
    } as any;

    const res = createMockResponse();

    await createDataSource(req, res as any);

    expect(createMock).toHaveBeenCalledWith(
      "Analytics DB",
      "mongodb",
      "mongodb://example",
      "org-1",
    );

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("rejects unsupported database type", async () => {
    const req = {
      body: {
        name: "My DB",
        type: "mysql",
        connectionUrl: "mysql://example",
        organizationId: "org-1",
      },
    } as any;

    const res = createMockResponse();

    await createDataSource(req, res as any);

    expect(createMock).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: "Unsupported data source type: mysql",
    });
  });

  it("rejects empty database type", async () => {
    const req = {
      body: {
        name: "My DB",
        type: "   ",
        connectionUrl: "connection",
        organizationId: "org-1",
      },
    } as any;

    const res = createMockResponse();

    await createDataSource(req, res as any);

    expect(createMock).not.toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(400);
  });
});