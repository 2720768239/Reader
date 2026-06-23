import ArticleMetadata from "./ArticleMetadata";

type ArticleHeaderProps = {
  title: string;
  publishedAt?: string;
  category?: string;
  product?: string;
};

export default function ArticleHeader({
  title,
  publishedAt,
  category,
  product
}: ArticleHeaderProps) {
  return (
    <header className="article-header">
      <h1>{title}</h1>
      <ArticleMetadata
        category={category}
        className="article-header__meta"
        product={product}
        publishedAt={publishedAt}
      />
    </header>
  );
}
