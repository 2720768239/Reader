import type {
  ReaderFontSize,
  ReaderPreferences,
  ReaderSpacing
} from "../lib/readerPreferences";

type ReaderControlsProps = {
  onFontSizeChange: (fontSize: ReaderFontSize) => void;
  onSpacingChange: (spacing: ReaderSpacing) => void;
  preferences: ReaderPreferences;
};

const FONT_SIZE_OPTIONS: Array<{ label: string; value: ReaderFontSize }> = [
  { label: "A-", value: "sm" },
  { label: "A", value: "md" },
  { label: "A+", value: "lg" }
];

const SPACING_OPTIONS: Array<{ label: string; value: ReaderSpacing }> = [
  { label: "Tight", value: "compact" },
  { label: "Comfort", value: "relaxed" },
  { label: "Wide", value: "airy" }
];

export default function ReaderControls({
  onFontSizeChange,
  onSpacingChange,
  preferences
}: ReaderControlsProps) {
  return (
    <section aria-label="Reading controls" className="reader-controls">
      <div className="reader-controls__group">
        <span className="reader-controls__label">Text size</span>
        <div className="reader-controls__options">
          {FONT_SIZE_OPTIONS.map((option) => (
            <button
              aria-pressed={preferences.fontSize === option.value}
              className="reader-chip"
              key={option.value}
              onClick={() => onFontSizeChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="reader-controls__group">
        <span className="reader-controls__label">Spacing</span>
        <div className="reader-controls__options">
          {SPACING_OPTIONS.map((option) => (
            <button
              aria-pressed={preferences.spacing === option.value}
              className="reader-chip"
              key={option.value}
              onClick={() => onSpacingChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
