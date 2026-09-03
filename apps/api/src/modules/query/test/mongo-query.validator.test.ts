import { describe, expect, it } from "vitest";
import { AppError } from "../../../infrastructure/http/app-error.js";
import { validateMongoQuery } from "../mongo-query.validator.js";

describe("validateMongoQuery", () => {
  it("normalizes a safe read query and applies the default limit", () => {
    expect(validateMongoQuery(JSON.stringify({
      collection: "customers",
      filter: { status: { $eq: "active" } },
    }))).toEqual({
      collection: "customers",
      filter: { status: { $eq: "active" } },
      limit: 100,
    });
  });

  it("rejects unsafe MongoDB operators", () => {
    expect(() => validateMongoQuery(JSON.stringify({
      collection: "customers",
      filter: { $where: "this.password" },
    }))).toThrowError(AppError);
  });

  it("rejects limits above the server maximum", () => {
    expect(() => validateMongoQuery(JSON.stringify({
      collection: "customers",
      filter: {},
      limit: 101,
    }))).toThrowError(AppError);
  });
});
