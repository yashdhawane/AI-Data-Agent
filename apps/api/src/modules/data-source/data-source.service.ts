import { prisma } from "../../infrastructure/database/prisma.js";
import { encrypt } from "../../infrastructure/security/encryption.js";

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
        type,
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