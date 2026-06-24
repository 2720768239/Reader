import { pairBlocks } from "./pairBlocks";
import { parseMetadata } from "./parseMetadata";
import type {
  ArticleRecord,
  ArticleBlock,
  ContentWarning,
  RawBlock,
  RawHeadingLevel
} from "./types";

function slugFromFilename(filename: string) {
  return filename.replace(/\.md$/i, "");
}

function parseHeading(line: string): RawBlock | null {
  const match = /^(#{2,6})\s+(.*)$/.exec(line);

  if (!match) {
    return null;
  }

  return {
    type: "heading",
    level: match[1].length as RawHeadingLevel,
    text: match[2].trim()
  };
}

function parseImage(line: string): RawBlock | null {
  const match = /^!\[(.*?)\]\((.*?)\)$/.exec(line);

  if (!match) {
    return null;
  }

  return {
    type: "image",
    alt: match[1],
    src: match[2]
  };
}

function normalizeBodyLine(line: string) {
  return line.trim().replace(/^>\s?/, "");
}

function isThematicBreak(line: string) {
  return /^(---|\*\*\*|___)$/.test(line);
}

function isListItem(line: string) {
  return /^([-*]\s+|\d+\.\s+)/.test(line);
}

function isTableRow(line: string) {
  return line.startsWith("|") && line.endsWith("|");
}

function headingHasStandaloneLanguage(block: ArticleBlock): block is Extract<ArticleBlock, { type: "heading"; text: string }> {
  return block.type === "heading" && "text" in block;
}

export function validateArticle(article: ArticleRecord) {
  for (let index = 0; index < article.blocks.length - 1; index += 1) {
    const current = article.blocks[index];
    const next = article.blocks[index + 1];

    if (
      headingHasStandaloneLanguage(current) &&
      headingHasStandaloneLanguage(next) &&
      current.level === next.level &&
      current.language === "en" &&
      next.language !== "en"
    ) {
      throw new Error(
        `Consecutive same-level standalone headings in "${article.id}": "${current.text}" / "${next.text}"`
      );
    }
  }
}

export function parseArticle(filename: string, markdown: string): ArticleRecord {
  const slug = slugFromFilename(filename);
  const lines = markdown.split(/\r?\n/);
  const metadata = parseMetadata(lines);
  const bodyLines = lines.slice(metadata.bodyStartIndex);
  const rawBlocks: RawBlock[] = [];
  const warnings: ContentWarning[] = [];
  const paragraphBuffer: string[] = [];
  let inCodeFence = false;

  const pushWarning = (code: ContentWarning["code"], message: string) => {
    warnings.push({ code, message });
  };

  const flushParagraph = () => {
    const text = paragraphBuffer.join(" ").trim();

    if (text) {
      rawBlocks.push({ type: "paragraph", text });
    }

    paragraphBuffer.length = 0;
  };

  for (const line of bodyLines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      inCodeFence = !inCodeFence;
      if (!inCodeFence) {
        pushWarning("code-fence", `Skipped fenced code block in "${slug}".`);
      }
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    if (isThematicBreak(trimmed)) {
      flushParagraph();
      pushWarning("thematic-break", `Skipped thematic break in "${slug}".`);
      continue;
    }

    if (isTableRow(trimmed)) {
      flushParagraph();
      const previousWarning = warnings.at(-1);
      if (previousWarning?.code !== "table") {
        pushWarning("table", `Skipped markdown table in "${slug}".`);
      }
      continue;
    }

    const heading = parseHeading(trimmed);
    if (heading) {
      flushParagraph();
      rawBlocks.push(heading);
      continue;
    }

    const image = parseImage(trimmed);
    if (image) {
      flushParagraph();
      rawBlocks.push(image);
      continue;
    }

    if (isListItem(trimmed)) {
      flushParagraph();
      rawBlocks.push({ type: "paragraph", text: normalizeBodyLine(trimmed) });
      continue;
    }

    paragraphBuffer.push(normalizeBodyLine(trimmed));
  }

  flushParagraph();

  const blocks = pairBlocks(rawBlocks, { articleId: slug });
  const preview = blocks.find((block) => block.type === "paragraph")?.english ?? "";
  const article: ArticleRecord = {
    id: slug,
    title: metadata.title,
    sourceUrl: metadata.sourceUrl ?? "",
    category: metadata.category ?? "",
    product: metadata.product ?? "",
    preview,
    blocks,
    warnings
  };

  validateArticle(article);
  return article;
}
