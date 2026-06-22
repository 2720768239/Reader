import { Link } from "react-router-dom";

import type { ArticleIndexEntry } from "../lib/content/types";

export default function ArticleCard({
  slug,
  title,
  publishedAt,
  category,
  preview
}: ArticleIndexEntry) {
  const meta = [publishedAt, category].filter(Boolean).join(" | ");

  return (
    <article className="article-card">
      <Link className="article-card__link" to={`/article/${slug}`}>
        <h2>{title}</h2>
        {meta ? <p className="article-card__meta">{meta}</p> : null}
        {preview ? <p className="article-card__preview">{preview}</p> : null}
      </Link>
    </article>
  );
}
