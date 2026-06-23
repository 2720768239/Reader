type ArticleMetadataProps = {
  className?: string;
  publishedAt?: string;
  category?: string;
  product?: string;
};

const metadataFields = [
  { key: "publishedAt", label: "Date" },
  { key: "category", label: "Category" },
  { key: "product", label: "Product" }
] as const;

export default function ArticleMetadata({
  className = "",
  publishedAt,
  category,
  product
}: ArticleMetadataProps) {
  const values = {
    publishedAt,
    category,
    product
  };

  if (!publishedAt && !category && !product) {
    return null;
  }

  return (
    <div
      aria-label="Article metadata"
      className={["article-metadata", className].filter(Boolean).join(" ")}
    >
      <div className="article-metadata__row article-metadata__row--labels">
        {metadataFields.map((field) => (
          <span className="article-metadata__cell" key={field.key}>
            {field.label}
          </span>
        ))}
      </div>
      <div className="article-metadata__row article-metadata__row--values">
        {metadataFields.map((field) => (
          <span className="article-metadata__cell" key={field.key}>
            {values[field.key] ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}
