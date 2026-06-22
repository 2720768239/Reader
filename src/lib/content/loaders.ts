import indexData from "../../content/index.json";
import type { ArticleIndexEntry, ArticleRecord } from "./types";

const articleModules = import.meta.glob("../../content/articles/*.json");

export function loadArticleIndex(): ArticleIndexEntry[] {
  return indexData as ArticleIndexEntry[];
}

export async function loadArticleBySlug(slug: string): Promise<ArticleRecord> {
  const loader = articleModules[`../../content/articles/${slug}.json`];

  if (!loader) {
    throw new Error(`Article not found: ${slug}`);
  }

  const module = (await loader()) as { default: ArticleRecord };
  return module.default;
}
