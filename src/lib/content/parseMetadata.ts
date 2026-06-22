export type ParsedMetadata = {
  title: string;
  sourceUrl?: string;
  publishedAt?: string;
  category?: string;
  bodyStartIndex: number;
};

const FIELD_ALIASES = {
  sourceUrl: ["原文链接", "来源", "source"],
  publishedAt: ["发布日期", "日期", "date"],
  category: ["分类", "category"]
} as const;

function normalizeMetadataLine(line: string) {
  return line
    .trim()
    .replace(/^>\s?/, "")
    .replace(/^-\s+/, "")
    .replace(/\*\*/g, "")
    .replace(/^\*|\*$/g, "")
    .replace(/：/g, ":");
}

function assignField(target: ParsedMetadata, key: keyof typeof FIELD_ALIASES, value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  if (key === "sourceUrl") {
    target.sourceUrl ??= trimmed;
  } else if (key === "publishedAt") {
    target.publishedAt ??= trimmed;
  } else if (key === "category") {
    target.category ??= trimmed;
  }
}

function parseMetadataToken(token: string, target: ParsedMetadata) {
  const normalized = token.trim();
  const colonIndex = normalized.indexOf(":");

  if (colonIndex === -1) {
    return;
  }

  const rawLabel = normalized.slice(0, colonIndex).trim();
  const value = normalized.slice(colonIndex + 1).trim();
  const label = rawLabel.toLowerCase();

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as Array<
    [keyof typeof FIELD_ALIASES, readonly string[]]
  >) {
    if (aliases.some((alias) => label === alias || label.includes(alias))) {
      assignField(target, field, value);
      return;
    }
  }
}

export function parseMetadata(lines: string[]): ParsedMetadata {
  const titleLine = lines.find((line) => line.trim().startsWith("# "));
  const title = titleLine?.trim().replace(/^#\s+/, "") || "Untitled";
  const result: ParsedMetadata = {
    title,
    bodyStartIndex: 0
  };

  for (let index = 0; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();

    if (trimmed === "---") {
      result.bodyStartIndex = index + 1;
      break;
    }

    if (!trimmed.startsWith(">") && !trimmed.startsWith("- ")) {
      continue;
    }

    const normalized = normalizeMetadataLine(trimmed);
    const parts = normalized.split("|");

    for (const part of parts) {
      parseMetadataToken(part, result);
    }
  }

  return result;
}
