const ARTICLE_ID_PATTERN = /^(\d{4})(\d{2})(\d{2})(?:-(\d{2}))?$/;

export function isValidArticleId(id: string): boolean {
  const match = ARTICLE_ID_PATTERN.exec(id);

  if (!match) {
    return false;
  }

  const month = Number(match[2]);
  const day = Number(match[3]);

  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

export function idToDateLabel(id: string): string {
  if (!isValidArticleId(id)) {
    throw new Error(`Invalid article id: ${id}`);
  }

  return `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}`;
}

export function nextIdForDate(existingIds: string[], date: string): string {
  if (!/^\d{8}$/.test(date)) {
    throw new Error(`Invalid date for id: ${date}`);
  }

  if (!existingIds.includes(date)) {
    return date;
  }

  let sequence = 1;

  while (existingIds.includes(`${date}-${String(sequence).padStart(2, "0")}`)) {
    sequence += 1;
  }

  return `${date}-${String(sequence).padStart(2, "0")}`;
}
