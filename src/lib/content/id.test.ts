import { describe, expect, it } from "vitest";

import { idToDateLabel, isValidArticleId, nextIdForDate } from "./id";

describe("isValidArticleId", () => {
  it("accepts a plain date id", () => {
    expect(isValidArticleId("20260610")).toBe(true);
  });

  it("accepts a date id with a sequence suffix", () => {
    expect(isValidArticleId("20260610-01")).toBe(true);
  });

  it("rejects ids with the wrong length", () => {
    expect(isValidArticleId("2026061")).toBe(false);
    expect(isValidArticleId("202606101")).toBe(false);
  });

  it("rejects a single-digit sequence suffix", () => {
    expect(isValidArticleId("20260610-1")).toBe(false);
  });

  it("rejects impossible month and day values", () => {
    expect(isValidArticleId("20261310")).toBe(false);
    expect(isValidArticleId("20260632")).toBe(false);
  });

  it("rejects non-date strings", () => {
    expect(isValidArticleId("agentic-surfaces")).toBe(false);
    expect(isValidArticleId("")).toBe(false);
  });
});

describe("idToDateLabel", () => {
  it("formats a plain date id as YYYY-MM-DD", () => {
    expect(idToDateLabel("20260610")).toBe("2026-06-10");
  });

  it("ignores the sequence suffix when formatting the date", () => {
    expect(idToDateLabel("20260610-02")).toBe("2026-06-10");
  });

  it("throws for an invalid id", () => {
    expect(() => idToDateLabel("not-a-date")).toThrow("Invalid article id");
  });
});

describe("nextIdForDate", () => {
  it("returns the plain date when there is no collision", () => {
    expect(nextIdForDate(["20260501"], "20260610")).toBe("20260610");
  });

  it("appends -01 when the plain date already exists", () => {
    expect(nextIdForDate(["20260610"], "20260610")).toBe("20260610-01");
  });

  it("increments past the largest existing suffix", () => {
    expect(
      nextIdForDate(["20260610", "20260610-01", "20260610-02"], "20260610")
    ).toBe("20260610-03");
  });

  it("rejects an invalid date input", () => {
    expect(() => nextIdForDate([], "2026-06-10")).toThrow("Invalid date");
  });
});
