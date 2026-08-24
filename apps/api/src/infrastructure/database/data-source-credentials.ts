import { prisma } from "./prisma.js";
import { decrypt } from "../security/encryption.js";

export async function getDataSourceConnectionUrl(
  dataSourceId: string,
): Promise<string> {
  const dataSource = await prisma.dataSource.findUnique({
    where: {
      id: dataSourceId,
    },
    select: {
      connectionUrl: true,
    },
  });

  if (!dataSource) {
    throw new Error("Data source not found");
  }

  return decrypt(dataSource.connectionUrl);
}