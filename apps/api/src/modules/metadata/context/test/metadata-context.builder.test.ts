import { describe, expect, it } from "vitest";

import { MetadataContextBuilder } from "../metadata-context.builder.js";
import type { DatabaseMetadata } from "../../metadata.types.js";

describe("MetadataContextBuilder", () => {
  it("builds context with tables and columns", () => {
    const metadata: DatabaseMetadata = {
      databaseType: "postgresql",
      dataModel: "relational",
      metadata: {
        tables: [
          {
            schema: "public",
            name: "customers",
          },
        ],
        columns: [
          {
            schema: "public",
            table: "customers",
            name: "id",
            dataType: "integer",
            nullable: false,
          },
          {
            schema: "public",
            table: "customers",
            name: "name",
            dataType: "text",
            nullable: false,
          },
        ],
        primaryKeys: [],
        foreignKeys: [],
      },
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain("DATABASE SCHEMA");
    expect(result).toContain("TABLE public.customers");
    expect(result).toContain("id: integer NOT NULL");
    expect(result).toContain("name: text NOT NULL");
  });

  it("includes primary key information", () => {
    const metadata: DatabaseMetadata = {
      databaseType: "postgresql",
      dataModel: "relational",
      metadata: {
        tables: [
          {
            schema: "public",
            name: "customers",
          },
        ],
        columns: [
          {
            schema: "public",
            table: "customers",
            name: "id",
            dataType: "integer",
            nullable: false,
          },
        ],
        primaryKeys: [
          {
            schema: "public",
            table: "customers",
            columns: ["id"],
          },
        ],
        foreignKeys: [],
      },
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain("PRIMARY KEY: id");
  });

  it("includes foreign key relationships", () => {
    const metadata: DatabaseMetadata = {
      databaseType: "postgresql",
      dataModel: "relational",
      metadata: {
        tables: [
          {
            schema: "public",
            name: "orders",
          },
          {
            schema: "public",
            name: "customers",
          },
        ],
        columns: [
          {
            schema: "public",
            table: "orders",
            name: "customer_id",
            dataType: "integer",
            nullable: false,
          },
          {
            schema: "public",
            table: "customers",
            name: "id",
            dataType: "integer",
            nullable: false,
          },
        ],
        primaryKeys: [],
        foreignKeys: [
          {
            schema: "public",
            table: "orders",
            columns: ["customer_id"],
            referencedSchema: "public",
            referencedTable: "customers",
            referencedColumns: ["id"],
          },
        ],
      },
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain("RELATIONSHIPS");
    expect(result).toContain(
      "public.orders.customer_id -> public.customers.id",
    );
  });

  it("supports composite foreign keys", () => {
    const metadata: DatabaseMetadata = {
      databaseType: "postgresql",
      dataModel: "relational",
      metadata: {
        tables: [
          {
            schema: "public",
            name: "orders",
          },
          {
            schema: "public",
            name: "customers",
          },
        ],
        columns: [
          {
            schema: "public",
            table: "orders",
            name: "customer_id",
            dataType: "integer",
            nullable: false,
          },
          {
            schema: "public",
            table: "orders",
            name: "customer_region",
            dataType: "text",
            nullable: false,
          },
        ],
        primaryKeys: [],
        foreignKeys: [
          {
            schema: "public",
            table: "orders",
            columns: [
              "customer_id",
              "customer_region",
            ],
            referencedSchema: "public",
            referencedTable: "customers",
            referencedColumns: [
              "id",
              "region",
            ],
          },
        ],
      },
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain(
      "public.orders.customer_id -> public.customers.id",
    );
    expect(result).toContain(
      "public.orders.customer_region -> public.customers.region",
    );
  });

  it("does not include relationships when there are no foreign keys", () => {
    const metadata: DatabaseMetadata = {
      databaseType: "postgresql",
      dataModel: "relational",
      metadata: {
        tables: [
          {
            schema: "public",
            name: "customers",
          },
        ],
        columns: [
          {
            schema: "public",
            table: "customers",
            name: "id",
            dataType: "integer",
            nullable: false,
          },
        ],
        primaryKeys: [],
        foreignKeys: [],
      },
    };

    

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain("DATABASE SCHEMA");
    expect(result).toContain("TABLE public.customers");
    expect(result).not.toContain("RELATIONSHIPS");
  }); 

  it("prints the generated metadata context", () => {
    const metadata: DatabaseMetadata = {
      databaseType: "postgresql",
      dataModel: "relational",
      metadata: {
        tables: [
          {
            schema: "public",
            name: "customers",
          },
          {
            schema: "public",
            name: "orders",
          },
        ],

        columns: [
          {
            schema: "public",
            table: "customers",
            name: "id",
            dataType: "integer",
            nullable: false,
          },
          {
            schema: "public",
            table: "customers",
            name: "name",
            dataType: "text",
            nullable: false,
          },
          {
            schema: "public",
            table: "customers",
            name: "email",
            dataType: "text",
            nullable: false,
          },
          {
            schema: "public",
            table: "customers",
            name: "created_at",
            dataType: "timestamp without time zone",
            nullable: true,
          },
          {
            schema: "public",
            table: "orders",
            name: "id",
            dataType: "integer",
            nullable: false,
          },
          {
            schema: "public",
            table: "orders",
            name: "customer_id",
            dataType: "integer",
            nullable: false,
          },
          {
            schema: "public",
            table: "orders",
            name: "amount",
            dataType: "numeric",
            nullable: true,
          },
        ],

        primaryKeys: [
          {
            schema: "public",
            table: "customers",
            columns: ["id"],
          },
          {
            schema: "public",
            table: "orders",
            columns: ["id"],
          },
        ],

        foreignKeys: [
          {
            schema: "public",
            table: "orders",
            columns: ["customer_id"],
            referencedSchema: "public",
            referencedTable: "customers",
            referencedColumns: ["id"],
          },
        ],
      },
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    console.log("\n========== GENERATED METADATA CONTEXT ==========\n");
    console.log(result);
    console.log("\n================================================\n");
  });
});
