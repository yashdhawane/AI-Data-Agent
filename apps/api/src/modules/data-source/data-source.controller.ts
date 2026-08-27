import { type Request, type Response } from "express";
import { DataSourceService } from "./data-source.service.js";
import { DataSourceConnectionService } from "./data-source.connection.service.js";
import { DataSourceType } from "../../generated/prisma/enums.js";

const dataSourceService = new DataSourceService();
const dataSourceConnectionService = new DataSourceConnectionService();

export async function createDataSource(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    name,
    type,
    connectionUrl,
    organizationId,
  } = req.body as {
    name?: unknown;
    type?: unknown;
    connectionUrl?: unknown;
    organizationId?: unknown;
  };

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof type !== "string" ||
    type.trim().length === 0 ||
    typeof connectionUrl !== "string" ||
    connectionUrl.trim().length === 0 ||
    typeof organizationId !== "string" ||
    organizationId.trim().length === 0
  ) {
    res.status(400).json({
      error: "name, type, connectionUrl and organizationId are required",
    });
    return;
  }

  if (
  !Object.values(DataSourceType).includes(
    type.trim() as DataSourceType,
  )
) {
  res.status(400).json({
    error: `Unsupported data source type: ${type}`,
  });
  return;
}

  const dataSource = await dataSourceService.create(
    name.trim(),
    type.trim(),
    connectionUrl.trim(),
    organizationId.trim(),
  );

  const { connectionUrl: _connectionUrl, ...safeDataSource } = dataSource;

  res.status(201).json(safeDataSource);
}

export async function testDataSourceConnection(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params;

 if (typeof id !== "string" || id.trim().length === 0) {
  res.status(400).json({
    error: "Data source id is required",
  });
  return;
}

  await dataSourceConnectionService.testConnection(id);

  res.status(200).json({
    status: "connected",
  });
}