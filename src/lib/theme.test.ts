import { afterEach, describe, expect, it } from "vitest";

import { applyTheme, readStoredTheme } from "./theme";

describe("theme helpers", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("stores and applies the selected theme", () => {
    applyTheme("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readStoredTheme()).toBe("dark");
  });
});
