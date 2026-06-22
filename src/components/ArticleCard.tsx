import { Link } from "react-router-dom";

import type { ArticleIndexEntry } from "../lib/content/types";

export default function ArticleCard({
  slug,
  title,
  publishedAt,
  category,
  preview
}: ArticleIndexEntry) {
  const meta = [publishedAt, category].filter(Boolean).join(" · ");

  return (
    <article className="library-card">
      <Link className="library-card__link" to={`/article/${slug}`}>
        <h2>{title}</h2>
      </Link>
      {meta ? <p className="library-card__meta">{meta}</p> : null}
      {preview ? <p className="library-card__preview">{preview}</p> : null}
    </article>
  );
}
