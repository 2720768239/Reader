export type ReaderFontSize = "sm" | "md" | "lg";
export type ReaderSpacing = "compact" | "relaxed" | "airy";

export type ReaderPreferences = {
  fontSize: ReaderFontSize;
  spacing: ReaderSpacing;
};

const STORAGE_KEY = "reader-preferences";

const DEFAULT_PREFERENCES: ReaderPreferences = {
  fontSize: "md",
  spacing: "relaxed"
};

function isFontSize(value: unknown): value is ReaderFontSize {
  return value === "sm" || value === "md" || value === "lg";
}

function isSpacing(value: unknown): value is ReaderSpacing {
  return value === "compact" || value === "relaxed" || value === "airy";
}

export function getDefaultReaderPreferences(): ReaderPreferences {
  return DEFAULT_PREFERENCES;
}

export function readStoredReaderPreferences(): ReaderPreferences {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReaderPreferences>;

    return {
      fontSize: isFontSize(parsed.fontSize) ? parsed.fontSize : DEFAULT_PREFERENCES.fontSize,
      spacing: isSpacing(parsed.spacing) ? parsed.spacing : DEFAULT_PREFERENCES.spacing
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function storeReaderPreferences(preferences: ReaderPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
