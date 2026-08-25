import type { DatabaseMetadata } from "./metadata.types.js";

export interface MetadataProvider {
  getMetadata(): Promise<DatabaseMetadata>;
}