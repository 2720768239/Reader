type ArticleHeaderProps = {
  title: string;
  publishedAt?: string;
  category?: string;
};

export default function ArticleHeader({ title, publishedAt, category }: ArticleHeaderProps) {
  const meta = [publishedAt, category].filter(Boolean).join(" | ");

  return (
    <header className="article-header">
      <h1>{title}</h1>
      {meta ? <p className="article-header__meta">{meta}</p> : null}
    </header>
  );
}
