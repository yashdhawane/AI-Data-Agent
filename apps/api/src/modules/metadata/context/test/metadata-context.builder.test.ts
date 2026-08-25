import { describe, expect, it } from "vitest";

import { MetadataContextBuilder } from "../metadata-context.builder.js";
import type { DatabaseMetadata } from "../../metadata.types.js";

describe("MetadataContextBuilder", () => {
  it("builds context with tables and columns", () => {
    const metadata: DatabaseMetadata = {
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
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain("TABLE public.customers");
    expect(result).toContain("id: integer NOT NULL");
    expect(result).toContain("name: text NOT NULL");
  });

  it("includes primary key information", () => {
    const metadata: DatabaseMetadata = {
      tables: [
        {
          schema: "public",
          name: "customers",
        },
      ],
      columns: [],
      primaryKeys: [
        {
          schema: "public",
          table: "customers",
          columns: ["id"],
        },
      ],
      foreignKeys: [],
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain("PRIMARY KEY: id");
  });

  it("includes foreign key relationships", () => {
    const metadata: DatabaseMetadata = {
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
      columns: [],
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
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain(
      "public.orders.customer_id -> public.customers.id",
    );
  });

  it("supports composite foreign keys", () => {
    const metadata: DatabaseMetadata = {
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
      columns: [],
      primaryKeys: [],
      foreignKeys: [
        {
          schema: "public",
          table: "orders",
          columns: ["tenant_id", "customer_id"],
          referencedSchema: "public",
          referencedTable: "customers",
          referencedColumns: ["tenant_id", "id"],
        },
      ],
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).toContain(
      "public.orders.tenant_id -> public.customers.tenant_id",
    );

    expect(result).toContain(
      "public.orders.customer_id -> public.customers.id",
    );
  });

  it("does not include relationships when there are no foreign keys", () => {
    const metadata: DatabaseMetadata = {
      tables: [
        {
          schema: "public",
          name: "customers",
        },
      ],
      columns: [],
      primaryKeys: [],
      foreignKeys: [],
    };

    const builder = new MetadataContextBuilder();

    const result = builder.build(metadata);

    expect(result).not.toContain("RELATIONSHIPS");
  });
});