import fs from "node:fs/promises";
import path from "node:path";

import { isValidArticleId, nextIdForDate } from "../src/lib/content/id";

const ARTICLES_DIR = path.resolve("src/content/articles");
const INDEX_PATH = path.resolve("src/content/index.json");
const IMAGES_DIR = path.resolve("public/images");

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function parsePublishedAt(value: string | undefined): string {
  if (!value) {
    throw new Error("Missing publishedAt");
  }

  const trimmed = value.trim();

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    return `${iso[1]}${iso[2]}${iso[3]}`;
  }

  const long = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/.exec(trimmed);
  if (long) {
    const month = MONTHS[long[1].toLowerCase()];
    if (month) {
      return `${long[3]}${pad2(month)}${pad2(Number(long[2]))}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getUTCFullYear()}${pad2(parsed.getUTCMonth() + 1)}${pad2(
      parsed.getUTCDate()
    )}`;
  }

  throw new Error(`Unparseable publishedAt: ${value}`);
}

type LegacyArticle = {
  slug?: string;
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  product?: string;
  preview?: string;
  blocks: Array<{ type?: string; src?: string }>;
};

type IndexEntry = {
  id: string;
  title: string;
  category?: string;
  product?: string;
  preview?: string;
};

async function main() {
  const files = (await fs.readdir(ARTICLES_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  const usedIds: string[] = [];
  const indexEntries: IndexEntry[] = [];
  const missingProduct: string[] = [];

  for (const file of files) {
    const oldPath = path.join(ARTICLES_DIR, file);
    const article = JSON.parse(await fs.readFile(oldPath, "utf8")) as LegacyArticle;
    const oldSlug = article.slug ?? file.replace(/\.json$/, "");

    const date = parsePublishedAt(article.publishedAt);
    const id = nextIdForDate(usedIds, date);
    usedIds.push(id);

    for (const block of article.blocks) {
      if (block.type === "image" && typeof block.src === "string") {
        block.src = block.src.replace(`images/${oldSlug}/`, `images/${id}/`);
      }
    }

    delete (article as Partial<LegacyArticle>).publishedAt;
    delete (article as Partial<LegacyArticle>).slug;
    (article as LegacyArticle & { id: string }).id = id;

    await fs.writeFile(
      path.join(ARTICLES_DIR, `${id}.json`),
      `${JSON.stringify(article, null, 2)}\n`,
      "utf8"
    );

    if (file !== `${id}.json`) {
      await fs.rm(oldPath, { force: true });
    }

    const oldImageDir = path.join(IMAGES_DIR, oldSlug);
    try {
      await fs.access(oldImageDir);
      await fs.rename(oldImageDir, path.join(IMAGES_DIR, id));
    } catch {
      // this article has no image directory
    }

    indexEntries.push({
      id,
      title: article.title,
      category: article.category,
      product: article.product,
      preview: article.preview
    });

    if (!article.product) {
      missingProduct.push(`${id} (${article.title})`);
    }
  }

  indexEntries.sort((left, right) => right.id.localeCompare(left.id));
  await fs.writeFile(INDEX_PATH, `${JSON.stringify(indexEntries, null, 2)}\n`, "utf8");

  for (const id of usedIds) {
    if (!isValidArticleId(id)) {
      throw new Error(`Migration produced an invalid id: ${id}`);
    }
  }

  console.log(`[migrate] migrated ${usedIds.length} articles to id-based schema.`);
  if (missingProduct.length > 0) {
    console.warn("[migrate] articles missing product (need Hermes cleanup):");
    for (const entry of missingProduct) {
      console.warn(`  - ${entry}`);
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
