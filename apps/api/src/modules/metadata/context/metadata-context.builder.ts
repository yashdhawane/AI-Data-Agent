import type { DatabaseMetadata } from "../metadata.types.js";

export class MetadataContextBuilder {
  build(metadata: DatabaseMetadata): string {
    if (metadata.dataModel !== "relational") {
      throw new Error(
        `Metadata context builder does not support data model: ${metadata.dataModel}`,
      );
    }

    const sections: string[] = [];

    sections.push(this.buildTables(metadata));
    sections.push(this.buildRelationships(metadata));

    return sections
      .filter(Boolean)
      .join("\n\n");
  }

  private buildTables(
    metadata: Extract<
      DatabaseMetadata,
      { dataModel: "relational" }
    >,
  ): string {
    const relationalMetadata = metadata.metadata;

    const tables = relationalMetadata.tables.map((table) => {
      const columns = relationalMetadata.columns
        .filter(
          (column) =>
            column.schema === table.schema &&
            column.table === table.name,
        )
        .map(
          (column) =>
            `    ${column.name}: ${column.dataType} ${
              column.nullable ? "NULL" : "NOT NULL"
            }`,
        )
        .join("\n");

      const primaryKey =
        relationalMetadata.primaryKeys.find(
          (key) =>
            key.schema === table.schema &&
            key.table === table.name,
        );

      const primaryKeyLine = primaryKey
        ? `  PRIMARY KEY: ${primaryKey.columns.join(", ")}`
        : "";

      return [
        `TABLE ${table.schema}.${table.name}`,
        primaryKeyLine,
        "  COLUMNS:",
        columns,
      ]
        .filter(Boolean)
        .join("\n");
    });

    return [
      "DATABASE SCHEMA",
      ...tables,
    ].join("\n\n");
  }

  private buildRelationships(
    metadata: Extract<
      DatabaseMetadata,
      { dataModel: "relational" }
    >,
  ): string {
    const foreignKeys =
      metadata.metadata.foreignKeys;

    if (foreignKeys.length === 0) {
      return "";
    }

    const relationships = foreignKeys
      .map((foreignKey) => {
        const mappings = foreignKey.columns.map(
          (column, index) => {
            const referencedColumn =
              foreignKey.referencedColumns[index];

            return `${foreignKey.schema}.${foreignKey.table}.${column} -> ${foreignKey.referencedSchema}.${foreignKey.referencedTable}.${referencedColumn}`;
          },
        );

        return mappings.join("\n  ");
      })
      .join("\n  ");

    return [
      "RELATIONSHIPS",
      `  ${relationships}`,
    ].join("\n");
  }
}