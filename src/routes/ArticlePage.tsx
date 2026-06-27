import { type CSSProperties, useEffect, useRef, useState } from "react";
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

const DEFAULT_READER_FONT_SIZE_REM = 1.08;
const READER_FONT_SIZE_STEP_REM = 0.08;
const MIN_READER_FONT_SIZE_REM = 0.72;
const DEFAULT_READER_LINE_HEIGHT = 1.95;
const READER_LINE_HEIGHT_STEP = 0.12;
const MIN_READER_LINE_HEIGHT = 1.45;
const DEFAULT_READER_PARAGRAPH_GAP_REM = 1.25;
const READER_PARAGRAPH_GAP_STEP_REM = 0.18;
const MIN_READER_PARAGRAPH_GAP_REM = 0.65;

type ReaderStyle = CSSProperties &
  Record<
    "--reader-font-size" | "--reader-line-height" | "--reader-paragraph-gap",
    string
  >;

function formatCssNumber(value: number): string {
  return Number(value.toFixed(2)).toString();
}

function getReaderStyle(preferences: ReaderPreferences): ReaderStyle {
  const fontSize = Math.max(
    MIN_READER_FONT_SIZE_REM,
    DEFAULT_READER_FONT_SIZE_REM +
      preferences.fontSizeLevel * READER_FONT_SIZE_STEP_REM
  );
  const lineHeight = Math.max(
    MIN_READER_LINE_HEIGHT,
    DEFAULT_READER_LINE_HEIGHT +
      preferences.spacingLevel * READER_LINE_HEIGHT_STEP
  );
  const paragraphGap = Math.max(
    MIN_READER_PARAGRAPH_GAP_REM,
    DEFAULT_READER_PARAGRAPH_GAP_REM +
      preferences.spacingLevel * READER_PARAGRAPH_GAP_STEP_REM
  );

  return {
    "--reader-font-size": `${formatCssNumber(fontSize)}rem`,
    "--reader-line-height": formatCssNumber(lineHeight),
    "--reader-paragraph-gap": `${formatCssNumber(paragraphGap)}rem`
  };
}

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

  const readerStyle = getReaderStyle(preferences);

  return (
    <main
      className="page-shell page-shell--reader"
      style={readerStyle}
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
              onFontSizeChange={(delta) => {
                setPreferences((current) => ({
                  ...current,
                  fontSizeLevel:
                    delta === 0 ? 0 : current.fontSizeLevel + delta
                }));
              }}
              onSpacingChange={(delta) => {
                setPreferences((current) => ({
                  ...current,
                  spacingLevel:
                    delta === 0 ? 0 : current.spacingLevel + delta
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
