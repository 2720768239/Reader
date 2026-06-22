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
      fontSize: "lg",
      spacing: "airy"
    });

    expect(readStoredReaderPreferences()).toEqual({
      fontSize: "lg",
      spacing: "airy"
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
