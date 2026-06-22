import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ArticleContent from "../components/ArticleContent";
import ArticleHeader from "../components/ArticleHeader";
import ReaderControls from "../components/ReaderControls";
import ThemeToggle from "../components/ThemeToggle";
import TranslationDrawer from "../components/TranslationDrawer";
import {
  readStoredReaderPreferences,
  storeReaderPreferences,
  type ReaderPreferences
} from "../lib/readerPreferences";
import { loadArticleBySlug } from "../lib/content/loaders";
import type { ArticleRecord } from "../lib/content/types";

export default function ArticlePage() {
  const { slug = "" } = useParams();
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [preferences, setPreferences] = useState<ReaderPreferences>(() =>
    readStoredReaderPreferences()
  );
  const [translation, setTranslation] = useState("");

  useEffect(() => {
    storeReaderPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    let cancelled = false;

    loadArticleBySlug(slug).then((nextArticle) => {
      if (!cancelled) {
        setArticle(nextArticle);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!article) {
    return <main className="page-shell">Loading…</main>;
  }

  return (
    <main
      className={`page-shell page-shell--reader reader-font-${preferences.fontSize} reader-spacing-${preferences.spacing}`}
    >
      <header className="topbar topbar--reader topbar--kindle">
        <Link aria-label="Back to library" className="toolbar-icon-button toolbar-icon-button--back" to="/">
          ‹
        </Link>
        <p className="toolbar-title">{article.title}</p>
        <div className="toolbar-actions">
          <button
            aria-expanded={isControlsOpen}
            aria-label="Open reading settings"
            className="toolbar-icon-button toolbar-icon-button--text"
            onClick={() => {
              setIsControlsOpen((current) => !current);
            }}
            type="button"
          >
            Aa
          </button>
          <ThemeToggle variant="icon" />
        </div>
      </header>
      <section className="reader-surface">
        <ArticleHeader
          category={article.category}
          publishedAt={article.publishedAt}
          title={article.title}
        />
        {isControlsOpen ? (
          <ReaderControls
            onFontSizeChange={(fontSize) => {
              setPreferences((current) => ({
                ...current,
                fontSize
              }));
            }}
            onSpacingChange={(spacing) => {
              setPreferences((current) => ({
                ...current,
                spacing
              }));
            }}
            preferences={preferences}
          />
        ) : null}
        <ArticleContent
          activeParagraphId={activeParagraphId}
          blocks={article.blocks}
          onParagraphSelect={(chinese, paragraphId) => {
            setActiveParagraphId(paragraphId);
            setTranslation(chinese);
          }}
        />
      </section>
      <TranslationDrawer
        onClose={() => {
          setActiveParagraphId(null);
          setTranslation("");
        }}
        open={Boolean(translation)}
        text={translation}
      />
    </main>
  );
}
