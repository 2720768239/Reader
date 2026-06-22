type TranslationDrawerProps = {
  onClose: () => void;
  open: boolean;
  text: string;
};

export default function TranslationDrawer({
  onClose,
  open,
  text
}: TranslationDrawerProps) {
  return (
    <aside
      aria-label="Selected translation"
      className={open ? "translation-drawer translation-drawer--open" : "translation-drawer"}
    >
      <div className="translation-drawer__handle" />
      <div className="translation-drawer__header">
        <h2>Translation</h2>
        <button aria-label="Close translation" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <p className="translation-drawer__text">{text}</p>
    </aside>
  );
}
