import type { DatabaseMetadata } from "../metadata.types.js";

export class MetadataContextBuilder {
  build(metadata: DatabaseMetadata): string {
    const sections: string[] = [];

    sections.push(this.buildTables(metadata));
    sections.push(this.buildRelationships(metadata));

    return sections
      .filter(Boolean)
      .join("\n\n");
  }

  private buildTables(metadata: DatabaseMetadata): string {
    const tables = metadata.tables.map((table) => {
      const columns = metadata.columns
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

      const primaryKey = metadata.primaryKeys.find(
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
    metadata: DatabaseMetadata,
  ): string {
    if (metadata.foreignKeys.length === 0) {
      return "";
    }

    const relationships = metadata.foreignKeys
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