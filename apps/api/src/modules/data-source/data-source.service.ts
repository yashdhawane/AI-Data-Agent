import { prisma } from "../../infrastructure/database/prisma.js";
import { encrypt } from "../../infrastructure/security/encryption.js";
import { DataSourceType } from "../../generated/prisma/enums.js";
import { DatabaseConnectorFactory } from "../../infrastructure/connectors/database-connector.factory.js";
import { AppError } from "../../infrastructure/http/app-error.js";

export class DataSourceService {
  async list(organizationId: string) {
    return prisma.dataSource.findMany({
      where: { organizationId },
      select: { id: true, name: true, type: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(
    name: string,
    type: string,
    connectionUrl: string,
    organizationId: string,
  ) {
    const connector = DatabaseConnectorFactory.create(type as DataSourceType, connectionUrl);
    try {
      await connector.testConnection();
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "3D000") {
        throw new AppError("The PostgreSQL database does not exist. Check the database name in the connection URL.", 400, "POSTGRES_DATABASE_NOT_FOUND");
      }
      if (error && typeof error === "object" && "code" in error && error.code === "28P01") {
        throw new AppError("PostgreSQL rejected the credentials. Check the username and password in the connection URL.", 400, "POSTGRES_INVALID_CREDENTIALS");
      }
      if (error && typeof error === "object" && "code" in error && error.code === "ECONNREFUSED") {
        throw new AppError("Could not reach PostgreSQL. Check the host and mapped port in the connection URL.", 400, "POSTGRES_CONNECTION_REFUSED");
      }
      throw new AppError("Could not verify the database connection.", 400, "DATA_SOURCE_CONNECTION_FAILED");
    } finally {
      await connector.close();
    }

    const encryptedConnectionUrl = encrypt(connectionUrl);

    return prisma.dataSource.create({
      data: {
        name,
        type: type as DataSourceType,
        connectionUrl: encryptedConnectionUrl,
        organization: {
          connect: {
            id: organizationId,
          },
        },
      },
    });
  }

  async remove(dataSourceId: string, organizationId: string): Promise<void> {
    const result = await prisma.dataSource.deleteMany({
      where: { id: dataSourceId, organizationId },
    });

    if (result.count === 0) {
      throw new AppError("Data source not found", 404, "DATA_SOURCE_NOT_FOUND");
    }
  }
}