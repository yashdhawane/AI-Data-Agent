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

export interface DatabaseMetadata {
  tables: TableMetadata[];
  columns: ColumnMetadata[];
}