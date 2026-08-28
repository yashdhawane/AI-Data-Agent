import { Pool, type QueryResultRow } from "pg";
import type { DatabaseConnector, DatabaseQueryResult } from "./database.connector.js";

export class PostgresConnector implements DatabaseConnector {
  readonly type = "postgresql" as const;
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      max: 5,
    });
  }

  async testConnection(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async query<T extends QueryResultRow = DatabaseQueryResult>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}