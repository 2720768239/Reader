export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "reader-theme";

export function readStoredTheme(): ThemeMode | null {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}

export function resolveInitialTheme(): ThemeMode {
  const stored = readStoredTheme();

  if (stored) {
    return stored;
  }

  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}
