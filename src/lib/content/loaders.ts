import indexData from "../../content/index.json";
import type { ArticleIndexEntry, ArticleRecord } from "./types";

const articleModules = import.meta.glob("../../content/articles/*.json");

export function loadArticleIndex(): ArticleIndexEntry[] {
  return indexData as unknown as ArticleIndexEntry[];
}

export async function loadArticleById(id: string): Promise<ArticleRecord> {
  const loader = articleModules[`../../content/articles/${id}.json`];

  if (!loader) {
    throw new Error(`Article not found: ${id}`);
  }

  const module = (await loader()) as { default: ArticleRecord };
  return module.default;
}
