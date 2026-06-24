import { useEffect, useRef, useState } from "react";
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
import { loadArticleById } from "../lib/content/loaders";
import type { ArticleRecord } from "../lib/content/types";

export default function ArticlePage() {
  const { id = "" } = useParams();
  const lastScrollYRef = useRef(0);
  const [activeParagraphId, setActiveParagraphId] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isTopbarVisible, setIsTopbarVisible] = useState(true);
  const [preferences, setPreferences] = useState<ReaderPreferences>(() =>
    readStoredReaderPreferences()
  );
  const [translation, setTranslation] = useState("");
  useEffect(() => {
    storeReaderPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    if (isControlsOpen) {
      setIsTopbarVisible(true);
    }
  }, [isControlsOpen]);

  useEffect(() => {
    let cancelled = false;

    loadArticleById(id).then((nextArticle) => {
      if (!cancelled) {
        setArticle(nextArticle);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!article) {
      return undefined;
    }

    const updateTopbarVisibility = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollYRef.current;

      if (currentY <= 16) {
        setIsTopbarVisible(true);
      } else if (currentY > previousY + 4 && !isControlsOpen) {
        setIsTopbarVisible(false);
      }

      lastScrollYRef.current = currentY;
    };

    updateTopbarVisibility();
    window.addEventListener("scroll", updateTopbarVisibility, { passive: true });
    window.addEventListener("resize", updateTopbarVisibility);

    return () => {
      window.removeEventListener("scroll", updateTopbarVisibility);
      window.removeEventListener("resize", updateTopbarVisibility);
    };
  }, [article, isControlsOpen]);

  if (!article) {
    return <main className="page-shell">Loading...</main>;
  }

  return (
    <main
      className={`page-shell page-shell--reader reader-font-${preferences.fontSize} reader-spacing-${preferences.spacing}`}
    >
      {isControlsOpen ? (
        <button
          aria-label="Close reading settings"
          className="reader-overlay reader-overlay--settings"
          onClick={() => {
            setIsControlsOpen(false);
          }}
          type="button"
        />
      ) : null}

      <header className={isTopbarVisible ? "topbar topbar--reader" : "topbar topbar--reader topbar--hidden"}>
        <div className="reader-nav">
          <Link aria-label="Back to library" className="toolbar-icon-button toolbar-icon-button--back" to="/">
            ←
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
        </div>

        <section
          aria-hidden={!isControlsOpen}
          className={
            isControlsOpen
              ? "reader-settings-sheet reader-settings-sheet--open"
              : "reader-settings-sheet"
          }
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
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
        </section>
      </header>

      <section
        className="reader-surface"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setIsTopbarVisible(true);
          }
        }}
      >
        <ArticleHeader
          category={article.category}
          id={article.id}
          product={article.product}
          sourceUrl={article.sourceUrl}
          title={article.title}
        />

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
