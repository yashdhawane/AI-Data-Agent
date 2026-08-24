import type {
  ColumnMetadata,
  TableMetadata,
} from "./metadata.types.js";

export interface MetadataProvider {
  getTables(): Promise<TableMetadata[]>;
  getColumns(): Promise<ColumnMetadata[]>;
}