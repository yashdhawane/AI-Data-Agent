import { describe, expect, it, vi } from "vitest";

import { SqlGenerationService } from "../sql-generation.service.js";
import type { LlmService } from "../../../llm/llm.service.js";

function createLlmMock(sql: string): LlmService {
  return {
    generate: vi.fn(),
    generateStructured: vi.fn().mockResolvedValue({
      sql,
    }),
  } as unknown as LlmService;
}

describe("SqlGenerationService", () => {
  const schema = JSON.stringify({
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
  });

  it("generates SQL from a natural-language question", async () => {
    const llm = createLlmMock(
      "SELECT * FROM customers",
    );

    const service = new SqlGenerationService(llm);

    const result = await service.generate({
      question: "Show me all customers",
      schema,
      intent: "READ_QUERY",
    });

    expect(result).toBe(
      "SELECT * FROM customers",
    );
  });

  it("passes the question and schema to the LLM", async () => {
    const llm = createLlmMock(
      "SELECT name FROM customers",
    );

    const service = new SqlGenerationService(llm);

    await service.generate({
      question: "Show customer names",
      schema,
      intent: "READ_QUERY",
    });

    expect(
      llm.generateStructured,
    ).toHaveBeenCalledOnce();

    expect(
      llm.generateStructured,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        userPrompt: "Show customer names",
        responseSchema: expect.any(Object),
      }),
    );

    const call = vi.mocked(
      llm.generateStructured,
    ).mock.calls[0]?.[0];

    expect(call?.systemPrompt).toContain(
      "customers",
    );
  });

  it("trims generated SQL", async () => {
    const llm = createLlmMock(
      "  SELECT * FROM customers;  ",
    );

    const service = new SqlGenerationService(llm);

    const result = await service.generate({
      question: "Show all customers",
      schema,
      intent: "READ_QUERY",
    });

    expect(result).toBe(
      "SELECT * FROM customers;",
    );
  });

  it("rejects an empty SQL response", async () => {
    const llm = createLlmMock("");

    const service = new SqlGenerationService(llm);

    await expect(
      service.generate({
        question: "Show all customers",
        schema,
        intent: "READ_QUERY",
      }),
    ).rejects.toMatchObject({
      code: "EMPTY_GENERATED_SQL",
    });
  });
  it("rejects SQL generation for a write operation", async () => {
  const llm = createLlmMock(
    "SELECT * FROM customers",
  );

  const service = new SqlGenerationService(llm);

  await expect(
    service.generate({
      question: "Delete all customers",
      schema,
      intent: "WRITE_OPERATION",
    }),
  ).rejects.toMatchObject({
    code: "SQL_GENERATION_NOT_ALLOWED",
  });

  expect(
    llm.generateStructured,
  ).not.toHaveBeenCalled();
});
});