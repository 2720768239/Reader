export type RawHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type RawBlock =
  | { type: "heading"; level: RawHeadingLevel; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; alt: string };

export type ContentLanguage = "en" | "zh" | "mixed";

export type ArticleHeadingBlock =
  | {
      type: "heading";
      level: 2 | 3 | 4 | 5 | 6;
      english: string;
      chinese: string;
    }
  | {
      type: "heading";
      level: 2 | 3 | 4 | 5 | 6;
      text: string;
      language: ContentLanguage;
    };

export type ArticleParagraphBlock = {
  type: "paragraph";
  id: string;
  english: string;
  chinese: string;
};

export type ArticleImageBlock = {
  type: "image";
  src: string;
  alt: string;
};

export type ArticleStandaloneBlock = {
  type: "standalone";
  text: string;
  language: ContentLanguage;
};

export type ContentWarningCode = "code-fence" | "table" | "thematic-break";

export type ContentWarning = {
  code: ContentWarningCode;
  message: string;
};

export type ArticleBlock =
  | ArticleHeadingBlock
  | ArticleParagraphBlock
  | ArticleImageBlock
  | ArticleStandaloneBlock;

export type ArticleRecord = {
  slug: string;
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  preview?: string;
  blocks: ArticleBlock[];
  warnings: ContentWarning[];
};

export type ArticleIndexEntry = Pick<
  ArticleRecord,
  "slug" | "title" | "publishedAt" | "category" | "preview"
>;
