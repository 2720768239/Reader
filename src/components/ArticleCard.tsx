import { Link } from "react-router-dom";

import type { ArticleIndexEntry } from "../lib/content/types";

type ArticleCardProps = ArticleIndexEntry & {
  primaryCategory?: string;
};

export default function ArticleCard({
  slug,
  title,
  publishedAt,
  category,
  preview,
  primaryCategory
}: ArticleCardProps) {
  const categoryText = primaryCategory ?? category;

  return (
    <article className="article-card" role="listitem">
      <Link className="article-card__link" to={`/article/${slug}`}>
        <div className="article-card__topline">
          {publishedAt ? (
            <p className="article-card__date">
              <span className="article-card__label">Date</span>
              <span>{publishedAt}</span>
            </p>
          ) : null}
        </div>
        <h2>{title}</h2>
        <div className="article-card__facts">
          {categoryText ? (
            <p className="article-card__fact">
              <span className="article-card__label">Category</span>
              <span>{categoryText}</span>
            </p>
          ) : null}
          <p className="article-card__fact">
            <span className="article-card__label">Reading</span>
            <span>English with tap-to-translate</span>
          </p>
        </div>
        {preview ? <p className="article-card__preview">{preview}</p> : null}
      </Link>
    </article>
  );
}
