import type { DataSourceType } from "../../generated/prisma/enums.js";

export type DatabaseQueryResult = Record<string, unknown>;

export interface DatabaseConnector {
  readonly type: DataSourceType;
  testConnection(): Promise<void>;
  query(sql: string, params?: unknown[]): Promise<DatabaseQueryResult[]>;
  close(): Promise<void>;
}
