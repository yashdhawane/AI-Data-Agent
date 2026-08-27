import type { DataModel } from "./data-model.js";

export interface DatabaseMetadata {
  databaseType: string;
  dataModel: DataModel;
  metadata: unknown;
}