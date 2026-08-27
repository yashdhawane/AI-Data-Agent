import { prisma } from "../../infrastructure/database/prisma.js";
import { encrypt } from "../../infrastructure/security/encryption.js";
import { DataSourceType } from "../../generated/prisma/enums.js";

export class DataSourceService {
  async create(
    name: string,
    type: string,
    connectionUrl: string,
    organizationId: string,
  ) {
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
}