export type ReaderPreferences = {
  fontSizeLevel: number;
  spacingLevel: number;
};

const STORAGE_KEY = "reader-preferences";

const DEFAULT_PREFERENCES: ReaderPreferences = {
  fontSizeLevel: 0,
  spacingLevel: 0
};

const LEGACY_FONT_SIZE_LEVELS = {
  sm: -1,
  md: 0,
  lg: 1
} as const;

const LEGACY_SPACING_LEVELS = {
  compact: -1,
  relaxed: 0,
  airy: 1
} as const;

function isReaderLevel(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function readLegacyLevel<T extends Record<string, number>>(
  value: unknown,
  legacyLevels: T
): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return legacyLevels[value as keyof T];
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
    const parsed = JSON.parse(raw) as Partial<
      ReaderPreferences & { fontSize: string; spacing: string }
    >;
    const legacyFontSizeLevel = readLegacyLevel(
      parsed.fontSize,
      LEGACY_FONT_SIZE_LEVELS
    );
    const legacySpacingLevel = readLegacyLevel(
      parsed.spacing,
      LEGACY_SPACING_LEVELS
    );

    return {
      fontSizeLevel: isReaderLevel(parsed.fontSizeLevel)
        ? parsed.fontSizeLevel
        : legacyFontSizeLevel ?? DEFAULT_PREFERENCES.fontSizeLevel,
      spacingLevel: isReaderLevel(parsed.spacingLevel)
        ? parsed.spacingLevel
        : legacySpacingLevel ?? DEFAULT_PREFERENCES.spacingLevel
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function storeReaderPreferences(preferences: ReaderPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
