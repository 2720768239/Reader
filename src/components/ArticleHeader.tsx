type ArticleHeaderProps = {
  title: string;
  publishedAt?: string;
  category?: string;
};

export default function ArticleHeader({ title, publishedAt, category }: ArticleHeaderProps) {
  const meta = [publishedAt, category].filter(Boolean).join(" · ");

  return (
    <header className="article-header">
      <p className="article-header__ornament">﹏</p>
      <p className="article-header__kicker">English edition</p>
      {meta ? <p className="article-header__meta">{meta}</p> : null}
      <h1>{title}</h1>
    </header>
  );
}
