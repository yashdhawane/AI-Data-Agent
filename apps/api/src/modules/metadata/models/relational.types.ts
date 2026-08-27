export interface TableMetadata {
  schema: string;
  name: string;
}

export interface ColumnMetadata {
  schema: string;
  table: string;
  name: string;
  dataType: string;
  nullable: boolean;
}

export interface PrimaryKeyMetadata {
  schema: string;
  table: string;
  columns: string[];
}

export interface ForeignKeyMetadata {
  schema: string;
  table: string;
  columns: string[];
  referencedSchema: string;
  referencedTable: string;
  referencedColumns: string[];
}

export interface RelationalMetadata {
  tables: TableMetadata[];
  columns: ColumnMetadata[];
  primaryKeys: PrimaryKeyMetadata[];
  foreignKeys: ForeignKeyMetadata[];
}