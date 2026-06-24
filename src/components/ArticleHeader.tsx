import ArticleMetadata from "./ArticleMetadata";

type ArticleHeaderProps = {
  title: string;
  id: string;
  category?: string;
  product?: string;
  sourceUrl?: string;
};

export default function ArticleHeader({
  title,
  id,
  category,
  product,
  sourceUrl
}: ArticleHeaderProps) {
  return (
    <header className="article-header">
      <h1>{title}</h1>
      <ArticleMetadata
        category={category}
        className="article-header__meta"
        id={id}
        product={product}
        sourceUrl={sourceUrl}
      />
    </header>
  );
}
