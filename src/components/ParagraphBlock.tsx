type ParagraphBlockProps = {
  id: string;
  isActive: boolean;
  onSelect: () => void;
  text: string;
};

export default function ParagraphBlock({
  id,
  isActive,
  onSelect,
  text
}: ParagraphBlockProps) {
  return (
    <button
      aria-pressed={isActive}
      className={isActive ? "paragraph-block paragraph-block--active" : "paragraph-block"}
      id={id}
      onClick={onSelect}
      type="button"
    >
      {text}
    </button>
  );
}
