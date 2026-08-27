import type { QueryResultRow } from "pg";
import type { MetadataProvider } from "../../modules/metadata/metadata.provider.js";
import type { DatabaseMetadata } from "../../modules/metadata/metadata.types.js";
import type {
  ColumnMetadata,
  ForeignKeyMetadata,
  PrimaryKeyMetadata,
  TableMetadata,
} from "../../modules/metadata/models/relational.types.js";
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

interface PrimaryKeyRow extends QueryResultRow {
  table_schema: string;
  table_name: string;
  column_name: string;
  ordinal_position: number;
}

interface ForeignKeyRow extends QueryResultRow {
  constraint_schema: string;
  constraint_name: string;

  table_schema: string;
  table_name: string;
  column_name: string;

  foreign_key_ordinal: number;
  referenced_column_ordinal: number | null;

  referenced_schema: string;
  referenced_table: string;
  referenced_column: string;
}

export class PostgresMetadataProvider implements MetadataProvider {
  constructor(
    private readonly connector: PostgresConnector,
  ) {}

  async getMetadata(): Promise<DatabaseMetadata> {
    const [
      tables,
      columns,
      primaryKeys,
      foreignKeys,
    ] = await Promise.all([
      this.getTables(),
      this.getColumns(),
      this.getPrimaryKeys(),
      this.getForeignKeys(),
    ]);

    return {
    databaseType: "postgresql",
    dataModel: "relational",
    metadata: {
      tables,
      columns,
      primaryKeys,
      foreignKeys,
  },
};
  }

  private async getTables(): Promise<TableMetadata[]> {
    const rows = await this.connector.query<TableRow>(
      `
        SELECT
          table_schema,
          table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN (
            'pg_catalog',
            'information_schema'
          )
        ORDER BY table_schema, table_name
      `,
    );

    return rows.map((row) => ({
      schema: row.table_schema,
      name: row.table_name,
    }));
  }

  private async getColumns(): Promise<ColumnMetadata[]> {
    const rows = await this.connector.query<ColumnRow>(
      `
        SELECT
          table_schema,
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema NOT IN (
          'pg_catalog',
          'information_schema'
        )
        ORDER BY
          table_schema,
          table_name,
          ordinal_position
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

  private async getPrimaryKeys(): Promise<PrimaryKeyMetadata[]> {
    const rows = await this.connector.query<PrimaryKeyRow>(
      `
        SELECT
          tc.table_schema,
          tc.table_name,
          kcu.column_name,
          kcu.ordinal_position
        FROM information_schema.table_constraints tc
        INNER JOIN information_schema.key_column_usage kcu
          ON tc.constraint_schema = kcu.constraint_schema
          AND tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema NOT IN (
            'pg_catalog',
            'information_schema'
          )
        ORDER BY
          tc.table_schema,
          tc.table_name,
          kcu.ordinal_position
      `,
    );

    const primaryKeys = new Map<
      string,
      PrimaryKeyMetadata
    >();

    for (const row of rows) {
      const key = `${row.table_schema}.${row.table_name}`;

      const existing = primaryKeys.get(key);

      if (existing) {
        existing.columns.push(row.column_name);
      } else {
        primaryKeys.set(key, {
          schema: row.table_schema,
          table: row.table_name,
          columns: [row.column_name],
        });
      }
    }

    return Array.from(primaryKeys.values());
  }

  private async getForeignKeys(): Promise<ForeignKeyMetadata[]> {
    const rows = await this.connector.query<ForeignKeyRow>(
      `
        SELECT
          tc.constraint_schema,
          tc.constraint_name,

          tc.table_schema,
          tc.table_name,
          kcu.column_name,

          kcu.ordinal_position AS foreign_key_ordinal,
          kcu.position_in_unique_constraint
            AS referenced_column_ordinal,

          ccu.table_schema AS referenced_schema,
          ccu.table_name AS referenced_table,
          ccu.column_name AS referenced_column

        FROM information_schema.table_constraints tc

        INNER JOIN information_schema.key_column_usage kcu
          ON tc.constraint_schema = kcu.constraint_schema
          AND tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name

        INNER JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_schema = ccu.constraint_schema
          AND tc.constraint_name = ccu.constraint_name

        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema NOT IN (
            'pg_catalog',
            'information_schema'
          )

        ORDER BY
          tc.constraint_schema,
          tc.constraint_name,
          kcu.ordinal_position
      `,
    );

    const foreignKeys = new Map<
      string,
      ForeignKeyMetadata
    >();

    for (const row of rows) {
      const key = [
        row.constraint_schema,
        row.constraint_name,
        row.table_schema,
        row.table_name,
      ].join(".");

      const existing = foreignKeys.get(key);

      if (existing) {
        existing.columns.push(row.column_name);
        existing.referencedColumns.push(
          row.referenced_column,
        );
      } else {
        foreignKeys.set(key, {
          schema: row.table_schema,
          table: row.table_name,
          columns: [row.column_name],

          referencedSchema: row.referenced_schema,
          referencedTable: row.referenced_table,
          referencedColumns: [
            row.referenced_column,
          ],
        });
      }
    }

    return Array.from(foreignKeys.values());
  }
}