import fs from "node:fs/promises";
import path from "node:path";

import { parseArticle } from "../src/lib/content/parseArticle";
import {
  ARTICLES_DIR,
  CONTENT_DIR,
  CONTENT_INDEX_PATH,
  DEFAULT_SOURCE_DIR,
  resolveSourceDir
} from "../src/lib/content/paths";
import type { ArticleIndexEntry } from "../src/lib/content/types";

async function recreateArticlesDir() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.rm(ARTICLES_DIR, { recursive: true, force: true });
  await fs.mkdir(ARTICLES_DIR, { recursive: true });
}

function parseCliArgs(argv: string[]) {
  const sourceIndex = argv.findIndex((argument) => argument === "--source");
  const sourceFromFlag =
    sourceIndex >= 0 && sourceIndex + 1 < argv.length ? argv[sourceIndex + 1] : undefined;
  const sourceFromEquals = argv.find((argument) => argument.startsWith("--source="))?.slice(9);

  return {
    sourceOverride: sourceFromFlag || sourceFromEquals || process.env.READER_ARTICLE_SOURCE_DIR
  };
}

async function loadMarkdownFiles(sourceDir: string) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function main() {
  const { sourceOverride } = parseCliArgs(process.argv.slice(2));
  const sourceDir = resolveSourceDir(sourceOverride);
  const files = await loadMarkdownFiles(sourceDir);

  await recreateArticlesDir();

  const index: ArticleIndexEntry[] = [];

  console.log(
    `[import:articles] source=${sourceDir} default=${resolveSourceDir(DEFAULT_SOURCE_DIR)}`
  );

  for (const file of files) {
    const fullPath = path.join(sourceDir, file);
    const markdown = await fs.readFile(fullPath, "utf8");
    const article = parseArticle(file, markdown);

    if (article.warnings.length > 0) {
      for (const warning of article.warnings) {
        console.warn(`[import:articles] ${article.slug}: ${warning.message}`);
      }
    }

    index.push({
      slug: article.slug,
      title: article.title,
      publishedAt: article.publishedAt,
      category: article.category,
      preview: article.preview
    });

    await fs.writeFile(
      path.join(ARTICLES_DIR, `${article.slug}.json`),
      JSON.stringify(article, null, 2),
      "utf8"
    );
  }

  await fs.writeFile(CONTENT_INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
