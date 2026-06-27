import { afterEach, describe, expect, it } from "vitest";

import {
  getDefaultReaderPreferences,
  readStoredReaderPreferences,
  storeReaderPreferences
} from "./readerPreferences";

describe("readerPreferences", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("stores and restores reader preferences", () => {
    storeReaderPreferences({
      fontSizeLevel: 2,
      spacingLevel: 1
    });

    expect(readStoredReaderPreferences()).toEqual({
      fontSizeLevel: 2,
      spacingLevel: 1
    });
  });

  it("migrates legacy reader preferences", () => {
    localStorage.setItem(
      "reader-preferences",
      JSON.stringify({
        fontSize: "lg",
        spacing: "compact"
      })
    );

    expect(readStoredReaderPreferences()).toEqual({
      fontSizeLevel: 1,
      spacingLevel: -1
    });
  });

  it("falls back to defaults for invalid stored values", () => {
    localStorage.setItem(
      "reader-preferences",
      JSON.stringify({
        fontSize: "xxl",
        spacing: "tight"
      })
    );

    expect(readStoredReaderPreferences()).toEqual(getDefaultReaderPreferences());
  });
});
