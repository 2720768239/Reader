import type { ReaderPreferences } from "../lib/readerPreferences";

type ReaderControlsProps = {
  onFontSizeChange: (delta: -1 | 0 | 1) => void;
  onSpacingChange: (delta: -1 | 0 | 1) => void;
  preferences: ReaderPreferences;
};

const FONT_SIZE_OPTIONS: Array<{ delta: -1 | 0 | 1; label: string }> = [
  { label: "A-", delta: -1 },
  { label: "A", delta: 0 },
  { label: "A+", delta: 1 }
];

const SPACING_OPTIONS: Array<{ delta: -1 | 0 | 1; label: string }> = [
  { label: "Tight", delta: -1 },
  { label: "Comfort", delta: 0 },
  { label: "Wide", delta: 1 }
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
              aria-pressed={option.delta === 0 && preferences.fontSizeLevel === 0}
              className="reader-chip"
              key={option.label}
              onClick={() => onFontSizeChange(option.delta)}
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
              aria-pressed={option.delta === 0 && preferences.spacingLevel === 0}
              className="reader-chip"
              key={option.label}
              onClick={() => onSpacingChange(option.delta)}
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
