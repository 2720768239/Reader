import path from "node:path";

export const DEFAULT_SOURCE_DIR = "E:/cwh/obsidiandata/work/Claude-Blog-Translations/2026";
export const CONTENT_DIR = path.resolve("src/content");
export const ARTICLES_DIR = path.join(CONTENT_DIR, "articles");
export const CONTENT_INDEX_PATH = path.join(CONTENT_DIR, "index.json");

export function resolveSourceDir(sourceOverride?: string) {
  return path.resolve(sourceOverride || DEFAULT_SOURCE_DIR);
}
