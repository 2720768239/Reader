import { useMemo, useState } from "react";

import ArticleCard from "../components/ArticleCard";
import { idToDateLabel } from "../lib/content/id";
import { loadArticleIndex } from "../lib/content/loaders";
import type { ArticleIndexEntry } from "../lib/content/types";

type SortOption = "newest" | "oldest" | "title";

function splitCategories(category?: string): string[] {
  if (!category) {
    return [];
  }

  return Array.from(
    new Set(
      category
        .split(/[,/|]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function matchesCategory(article: ArticleIndexEntry, category: string): boolean {
  if (category === "All categories") {
    return true;
  }

  return splitCategories(article.category).includes(category);
}

export default function HomePage() {
  const articles = loadArticleIndex();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const categories = useMemo(
    () => [
      "All categories",
      ...Array.from(
        new Set(articles.flatMap((article) => splitCategories(article.category)))
      ).sort((left, right) => left.localeCompare(right))
    ],
    [articles]
  );

  const visibleArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...articles]
      .filter((article) => matchesCategory(article, categoryFilter))
      .filter((article) => {
        if (!normalizedQuery) {
          return true;
        }

        const haystack = [
          article.title,
          article.preview,
          article.category,
          article.product,
          idToDateLabel(article.id)
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedQuery);
      })
      .sort((left, right) => {
        if (sort === "title") {
          return left.title.localeCompare(right.title);
        }

        return sort === "oldest"
          ? left.id.localeCompare(right.id)
          : right.id.localeCompare(left.id);
      });
  }, [articles, categoryFilter, query, sort]);

  return (
    <main className="page-shell page-shell--library">
      <h1 className="visually-hidden">Reader Library</h1>

      <section className="library-controls" aria-label="Library controls">
        <div className="library-toolbar">
          <label className="library-search">
            <span className="library-search__label">Search articles</span>
            <input
              aria-label="Search articles"
              className="library-search__input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, preview, category, product, or date"
              type="search"
              value={query}
            />
          </label>

          <button
            aria-controls="library-filter-panel"
            aria-expanded={isFiltersOpen}
            aria-label={isFiltersOpen ? "Close library filters" : "Open library filters"}
            className="library-filter-toggle"
            onClick={() => setIsFiltersOpen((current) => !current)}
            type="button"
          >
            <span className="library-filter-toggle__icon" aria-hidden="true">
              ≣
            </span>
            <span className="library-filter-toggle__text">Filter</span>
          </button>
        </div>

        {isFiltersOpen ? (
          <div className="library-filters" id="library-filter-panel">
            <label className="library-select">
              <span className="library-select__label">Sort by</span>
              <select
                aria-label="Sort by"
                onChange={(event) => setSort(event.target.value as SortOption)}
                value={sort}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A-Z</option>
              </select>
            </label>

            <label className="library-select">
              <span className="library-select__label">Filter by category</span>
              <select
                aria-label="Filter by category"
                onChange={(event) => setCategoryFilter(event.target.value)}
                value={categoryFilter}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </section>

      <section className="library-results">
        <div className="library-results__summary">
          <p>{visibleArticles.length} articles</p>
          {categoryFilter !== "All categories" ? <p>{categoryFilter}</p> : null}
        </div>

        <div aria-label="Article list" className="article-list" role="list">
          {visibleArticles.map((article) => (
            <ArticleCard
              key={article.id}
              {...article}
              primaryCategory={splitCategories(article.category)[0]}
            />
          ))}
        </div>

        {visibleArticles.length === 0 ? (
          <p className="library-empty">No articles match this search yet.</p>
        ) : null}
      </section>
    </main>
  );
}
