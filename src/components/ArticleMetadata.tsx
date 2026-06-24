import type { ReactNode } from "react";

import { idToDateLabel } from "../lib/content/id";

type ArticleMetadataProps = {
  className?: string;
  id: string;
  category?: string;
  product?: string;
  sourceUrl?: string;
};

const FIELD_DEFS = [
  { key: "date", label: "Date" },
  { key: "category", label: "Category" },
  { key: "product", label: "Product" },
  { key: "source", label: "Source" }
] as const;

type FieldKey = (typeof FIELD_DEFS)[number]["key"];

export default function ArticleMetadata({
  className = "",
  id,
  category,
  product,
  sourceUrl
}: ArticleMetadataProps) {
  const values: Record<FieldKey, ReactNode> = {
    date: idToDateLabel(id),
    category: category ?? "",
    product: product ?? "",
    source: sourceUrl ? (
      <a href={sourceUrl} rel="noreferrer noopener" target="_blank">
        Click here
      </a>
    ) : (
      ""
    )
  };

  const visibleFields = FIELD_DEFS.filter((field) => {
    if (field.key === "source") {
      return Boolean(sourceUrl);
    }

    return Boolean(values[field.key]);
  });

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Article metadata"
      className={["article-metadata", className].filter(Boolean).join(" ")}
    >
      <div className="article-metadata__row article-metadata__row--labels">
        {visibleFields.map((field) => (
          <span className="article-metadata__cell" key={field.key}>
            {field.label}
          </span>
        ))}
      </div>
      <div className="article-metadata__row article-metadata__row--values">
        {visibleFields.map((field) => (
          <span className="article-metadata__cell" key={field.key}>
            {values[field.key]}
          </span>
        ))}
      </div>
    </div>
  );
}
