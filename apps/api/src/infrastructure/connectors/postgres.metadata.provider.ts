import type { QueryResultRow } from "pg";
import type { MetadataProvider } from "../../modules/metadata/metadata.provider.js";
import type {
  ColumnMetadata,
  TableMetadata,
} from "../../modules/metadata/metadata.types.js";
import { PostgresConnector } from "./postgres.connector.js";

interface TableRow extends QueryResultRow {
  table_schema: string;
  table_name: string;
}

interface ColumnRow extends QueryResultRow {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
}

export class PostgresMetadataProvider implements MetadataProvider {
  constructor(private readonly connector: PostgresConnector) {}

  async getTables(): Promise<TableMetadata[]> {
    const rows = await this.connector.query<TableRow>(
      `
        SELECT
          table_schema,
          table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name
      `,
    );

    return rows.map((row) => ({
      schema: row.table_schema,
      name: row.table_name,
    }));
  }

  async getColumns(): Promise<ColumnMetadata[]> {
    const rows = await this.connector.query<ColumnRow>(
      `
        SELECT
          table_schema,
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name, ordinal_position
      `,
    );

    return rows.map((row) => ({
      schema: row.table_schema,
      table: row.table_name,
      name: row.column_name,
      dataType: row.data_type,
      nullable: row.is_nullable === "YES",
    }));
  }
}