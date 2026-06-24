import { Link } from "react-router-dom";

import ArticleMetadata from "./ArticleMetadata";
import type { ArticleIndexEntry } from "../lib/content/types";

type ArticleCardProps = ArticleIndexEntry & {
  primaryCategory?: string;
};

export default function ArticleCard({
  id,
  title,
  category,
  product,
  primaryCategory
}: ArticleCardProps) {
  const categoryText = primaryCategory ?? category;

  return (
    <article className="article-card" role="listitem">
      <Link className="article-card__link" to={`/article/${id}`}>
        <h2>{title}</h2>
        <ArticleMetadata
          category={categoryText}
          className="article-card__facts"
          id={id}
          product={product}
        />
      </Link>
    </article>
  );
}
