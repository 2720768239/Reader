import type { ArticleBlock, ContentLanguage, RawBlock } from "./types";

type PairBlocksOptions = {
  articleId?: string;
};

const CJK_REGEX = /[\u3400-\u9fff]/gu;
const LATIN_REGEX = /[A-Za-z]/gu;
const CHINESE_PUNCTUATION_REGEX = /[，。；：！？（）【】《》、“”‘’]/u;

function countMatches(regex: RegExp, text: string) {
  return text.match(regex)?.length ?? 0;
}

function normalizeMarkdownText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function detectLeadingScript(text: string) {
  const normalized = normalizeMarkdownText(text);
  const match = normalized.match(/[\u3400-\u9fffA-Za-z]/u);

  if (!match) {
    return null;
  }

  return /[\u3400-\u9fff]/u.test(match[0]) ? "zh" : "en";
}

function detectLanguage(text: string): ContentLanguage | null {
  const normalized = normalizeMarkdownText(text);
  const chineseCount = countMatches(CJK_REGEX, normalized);
  const latinCount = countMatches(LATIN_REGEX, normalized);
  const leadingScript = detectLeadingScript(normalized);

  if (chineseCount === 0 && latinCount > 0) {
    return "en";
  }

  if (chineseCount > 0 && latinCount === 0) {
    return "zh";
  }

  if (chineseCount > 0 && latinCount > 0) {
    if (leadingScript === "zh") {
      return "zh";
    }

    if (CHINESE_PUNCTUATION_REGEX.test(normalized) || chineseCount >= 2) {
      return "mixed";
    }

    return "en";
  }

  return null;
}

function isParagraphChinese(text: string) {
  const normalized = normalizeMarkdownText(text);
  const chineseCount = countMatches(CJK_REGEX, normalized);
  const latinCount = countMatches(LATIN_REGEX, normalized);

  if (chineseCount === 0) {
    return false;
  }

  if (detectLeadingScript(normalized) === "zh") {
    return true;
  }

  return CHINESE_PUNCTUATION_REGEX.test(normalized) || chineseCount >= latinCount || chineseCount >= 8;
}

function isParagraphEnglish(text: string) {
  const normalized = normalizeMarkdownText(text);
  const chineseCount = countMatches(CJK_REGEX, normalized);
  const latinCount = countMatches(LATIN_REGEX, normalized);

  if (latinCount === 0) {
    return false;
  }

  if (detectLeadingScript(normalized) === "en" && !isParagraphChinese(normalized)) {
    return true;
  }

  return chineseCount < 8 && latinCount >= chineseCount;
}

function isLocalizedHeading(text: string) {
  const language = detectLanguage(text);
  return language === "zh" || language === "mixed";
}

function describeBlock(block: RawBlock) {
  if (block.type === "image") {
    return `image ${block.src}`;
  }

  return `${block.type} "${block.text.slice(0, 40)}"`;
}

function pairingError(articleId: string | undefined, block: RawBlock) {
  const label = articleId ?? "article";
  return new Error(`Unable to pair ${block.type} in ${label}: ${describeBlock(block)}`);
}

function detectParagraphLanguage(text: string): ContentLanguage | null {
  if (isParagraphChinese(text)) {
    return "zh";
  }

  if (isParagraphEnglish(text)) {
    return "en";
  }

  return detectLanguage(text);
}

function isStandaloneMarkdownLinkParagraph(text: string) {
  return /\[[^\]]+\]\(https?:\/\/[^)]+\)/.test(text);
}

function isIgnorableTrailingFooterNote(block: RawBlock, index: number, total: number) {
  return (
    block.type === "paragraph" &&
    index === total - 1 &&
    isParagraphChinese(block.text) &&
    /^\*.*\*$/.test(block.text.trim())
  );
}

function isIgnorableTrailingSourceNote(block: RawBlock, index: number, total: number) {
  return (
    block.type === "paragraph" &&
    index === total - 1 &&
    /^\*.*\*$/.test(block.text.trim()) &&
    /(source:|原文链接[:：]|https?:\/\/)/i.test(block.text)
  );
}

function hasStandaloneHeadingLanguage(block: ArticleBlock): block is Extract<ArticleBlock, { type: "heading"; text: string }> {
  return block.type === "heading" && "text" in block;
}

function validateHeadingSequence(blocks: ArticleBlock[], articleId?: string) {
  for (let index = 0; index < blocks.length - 1; index += 1) {
    const current = blocks[index];
    const next = blocks[index + 1];

    if (
      hasStandaloneHeadingLanguage(current) &&
      hasStandaloneHeadingLanguage(next) &&
      current.level === next.level &&
      current.language === "en" &&
      next.language !== "en"
    ) {
      const label = articleId ?? "article";
      throw new Error(
        `Consecutive same-level standalone headings in "${label}": "${current.text}" / "${next.text}"`
      );
    }
  }
}

export function pairBlocks(rawBlocks: RawBlock[], options: PairBlocksOptions = {}): ArticleBlock[] {
  const result: ArticleBlock[] = [];
  let paragraphCount = 0;
  let standaloneSectionLanguage: ContentLanguage | null = null;

  for (let index = 0; index < rawBlocks.length; index += 1) {
    const current = rawBlocks[index];

    if (current.type === "image") {
      result.push(current);
      continue;
    }

    const inlineImages: Extract<RawBlock, { type: "image" }>[] = [];
    let nextIndex = index + 1;

    while (rawBlocks[nextIndex]?.type === "image") {
      inlineImages.push(rawBlocks[nextIndex] as Extract<RawBlock, { type: "image" }>);
      nextIndex += 1;
    }

    const next = rawBlocks[nextIndex];

    if (
      current.type === "heading" &&
      current.level >= 2 &&
      detectLanguage(current.text) === "en" &&
      next?.type === "heading" &&
      next.level === current.level &&
      isLocalizedHeading(next.text)
    ) {
      const level = current.level as 2 | 3 | 4 | 5 | 6;
      result.push({
        type: "heading",
        level,
        english: current.text,
        chinese: next.text
      });
      standaloneSectionLanguage = null;
      index = nextIndex;
      continue;
    }

    if (
      current.type === "paragraph" &&
      isParagraphEnglish(current.text) &&
      next?.type === "paragraph" &&
      isParagraphChinese(next.text)
    ) {
      paragraphCount += 1;
      result.push({
        type: "paragraph",
        id: `p-${paragraphCount}`,
        english: current.text,
        chinese: next.text
      });
      result.push(...inlineImages);
      standaloneSectionLanguage = null;
      index = nextIndex;
      continue;
    }

    if (current.type === "paragraph" && isParagraphEnglish(current.text)) {
      const englishRun: Extract<RawBlock, { type: "paragraph" }>[] = [];
      let runIndex = index;

      while (
        rawBlocks[runIndex]?.type === "paragraph" &&
        isParagraphEnglish((rawBlocks[runIndex] as Extract<RawBlock, { type: "paragraph" }>).text)
      ) {
        englishRun.push(rawBlocks[runIndex] as Extract<RawBlock, { type: "paragraph" }>);
        runIndex += 1;
      }

      const chineseRun: Extract<RawBlock, { type: "paragraph" }>[] = [];

      while (
        rawBlocks[runIndex]?.type === "paragraph" &&
        isParagraphChinese((rawBlocks[runIndex] as Extract<RawBlock, { type: "paragraph" }>).text)
      ) {
        chineseRun.push(rawBlocks[runIndex] as Extract<RawBlock, { type: "paragraph" }>);
        runIndex += 1;
      }

      if (englishRun.length > 0 && englishRun.length === chineseRun.length) {
        for (let pairIndex = 0; pairIndex < englishRun.length; pairIndex += 1) {
          paragraphCount += 1;
          result.push({
            type: "paragraph",
            id: `p-${paragraphCount}`,
            english: englishRun[pairIndex].text,
            chinese: chineseRun[pairIndex].text
          });
        }

        standaloneSectionLanguage = null;
        index = runIndex - 1;
        continue;
      }
    }

    if (current.type === "heading" && current.level >= 2) {
      const level = current.level as 2 | 3 | 4 | 5 | 6;
      const language = detectLanguage(current.text) ?? "mixed";

      standaloneSectionLanguage = language;
      result.push({
        type: "heading",
        level,
        text: current.text,
        language
      });
      continue;
    }

    if (isIgnorableTrailingFooterNote(current, index, rawBlocks.length)) {
      continue;
    }

    if (isIgnorableTrailingSourceNote(current, index, rawBlocks.length)) {
      continue;
    }

    if (
      current.type === "paragraph" &&
      standaloneSectionLanguage === "zh" &&
      isParagraphChinese(current.text)
    ) {
      result.push({
        type: "standalone",
        text: current.text,
        language: "zh"
      });
      continue;
    }

    if (
      current.type === "paragraph" &&
      standaloneSectionLanguage === "mixed" &&
      detectParagraphLanguage(current.text) !== "en"
    ) {
      result.push({
        type: "standalone",
        text: current.text,
        language: detectParagraphLanguage(current.text) ?? "mixed"
      });
      continue;
    }

    if (
      current.type === "paragraph" &&
      standaloneSectionLanguage === "en" &&
      isParagraphEnglish(current.text)
    ) {
      result.push({
        type: "standalone",
        text: current.text,
        language: "en"
      });
      continue;
    }

    if (current.type === "paragraph" && isStandaloneMarkdownLinkParagraph(current.text)) {
      result.push({
        type: "standalone",
        text: current.text,
        language: detectParagraphLanguage(current.text) ?? "en"
      });
      continue;
    }

    if (current.type === "paragraph") {
      const runLanguage = detectParagraphLanguage(current.text);

      if (runLanguage) {
        const standaloneRun: Extract<RawBlock, { type: "paragraph" }>[] = [];
        let runIndex = index;

        while (
          rawBlocks[runIndex]?.type === "paragraph" &&
          detectParagraphLanguage(
            (rawBlocks[runIndex] as Extract<RawBlock, { type: "paragraph" }>).text
          ) === runLanguage
        ) {
          standaloneRun.push(rawBlocks[runIndex] as Extract<RawBlock, { type: "paragraph" }>);
          runIndex += 1;
        }

        if (standaloneRun.length >= 2 && rawBlocks[runIndex]?.type !== "paragraph") {
          for (const block of standaloneRun) {
            result.push({
              type: "standalone",
              text: block.text,
              language: runLanguage
            });
          }

          index = runIndex - 1;
          continue;
        }
      }
    }

    throw pairingError(options.articleId, current);
  }

  validateHeadingSequence(result, options.articleId);
  return result;
}
