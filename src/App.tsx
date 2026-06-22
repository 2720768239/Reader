import { Route, Routes } from "react-router-dom";

function HomePlaceholder() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Reader</p>
        <h1>Mobile-first reading app bootstrap</h1>
        <p className="lede">
          Home page route placeholder. Replace this with the real article list in a later task.
        </p>
      </section>
    </main>
  );
}

function ArticlePlaceholder() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Reader</p>
        <h1>Article route placeholder</h1>
        <p className="lede">
          Article page route placeholder. Replace this with the real reader view in a later task.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
      <Route path="/article/:slug" element={<ArticlePlaceholder />} />
    </Routes>
  );
}
