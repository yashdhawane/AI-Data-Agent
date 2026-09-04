import { describe, expect, it } from "vitest";
import { applyQueryLimit } from "../query.limit.js";

describe("applyQueryLimit", () => {
  it("adds LIMIT 1000 when no limit exists", async () => {
    const result = await applyQueryLimit(
      "SELECT * FROM customers",
    );

    expect(result).toContain("LIMIT 1000");
  });

  it("keeps an existing limit below 1000", async () => {
    const result = await applyQueryLimit(
      "SELECT * FROM customers LIMIT 10",
    );

    expect(result).toContain("LIMIT 10");
    expect(result).not.toContain("LIMIT 1000");
  });

  it("reduces a limit greater than 1000", async () => {
    const result = await applyQueryLimit(
      "SELECT * FROM customers LIMIT 5000",
    );

    expect(result).toContain("LIMIT 1000");
    expect(result).not.toContain("LIMIT 5000");
  });

  it("handles SELECT with WHERE and ORDER BY", async () => {
    const result = await applyQueryLimit(
      "SELECT id, name FROM customers WHERE id > 0 ORDER BY name",
    );

    expect(result).toContain("LIMIT 1000");
  });

  it("rejects non-SELECT queries", async () => {
    await expect(
      applyQueryLimit(
        "DELETE FROM customers WHERE id = 1",
      ),
    ).rejects.toThrow(
      "Only SELECT queries are allowed",
    );
  });

  it("limits multiple read-only statements", async () => {
    const result = await applyQueryLimit(
      "SELECT * FROM customers; SELECT * FROM customers",
    );

    expect(result.match(/LIMIT 1000/g)).toHaveLength(2);
  });
});