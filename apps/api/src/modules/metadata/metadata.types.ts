import type { RelationalMetadata } from "./models/relational.types.js";

export interface RelationalDatabaseMetadata {
  databaseType: string;
  dataModel: "relational";
  metadata: RelationalMetadata;
}

export interface DocumentDatabaseMetadata {
  databaseType: string;
  dataModel: "document";
  metadata: unknown;
}

export interface KeyValueDatabaseMetadata {
  databaseType: string;
  dataModel: "key_value";
  metadata: unknown;
}

export interface WideColumnDatabaseMetadata {
  databaseType: string;
  dataModel: "wide_column";
  metadata: unknown;
}

export interface GraphDatabaseMetadata {
  databaseType: string;
  dataModel: "graph";
  metadata: unknown;
}

export type DatabaseMetadata =
  | RelationalDatabaseMetadata
  | DocumentDatabaseMetadata
  | KeyValueDatabaseMetadata
  | WideColumnDatabaseMetadata
  | GraphDatabaseMetadata;