import ArticleCard from "../components/ArticleCard";
import ThemeToggle from "../components/ThemeToggle";
import { loadArticleIndex } from "../lib/content/loaders";

export default function HomePage() {
  const articles = loadArticleIndex();

  return (
    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Kindle-style Reader</p>
          <h1>Read in English. Tap a passage for Chinese.</h1>
        </div>
        <ThemeToggle variant="icon" />
      </header>
      <section className="article-list">
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </section>
    </main>
  );
}
