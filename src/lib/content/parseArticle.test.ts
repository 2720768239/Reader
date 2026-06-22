import { describe, expect, it } from "vitest";

import { parseArticle, validateArticle } from "./parseArticle";

describe("parseArticle", () => {
  it("extracts metadata and pairs translated content blocks", () => {
    const markdown = `# Example Title

> 原文链接：https://example.com/post
> 发布日期：June 10, 2026
> 分类：Agents

---

English intro paragraph.

中文介绍段落。

## Section One

## 第一节

![Diagram](images/example.png)

Another english paragraph.

另一段中文。
`;

    const article = parseArticle("01-example.md", markdown);

    expect(article).toEqual({
      slug: "01-example",
      title: "Example Title",
      sourceUrl: "https://example.com/post",
      publishedAt: "June 10, 2026",
      category: "Agents",
      preview: "English intro paragraph.",
      blocks: [
        {
          type: "paragraph",
          id: "p-1",
          english: "English intro paragraph.",
          chinese: "中文介绍段落。"
        },
        {
          type: "heading",
          level: 2,
          english: "Section One",
          chinese: "第一节"
        },
        {
          type: "image",
          src: "images/example.png",
          alt: "Diagram"
        },
        {
          type: "paragraph",
          id: "p-2",
          english: "Another english paragraph.",
          chinese: "另一段中文。"
        }
      ],
      warnings: []
    });
  });

  it("accepts bold metadata labels and mixed single-line metadata", () => {
    const markdown = `# Another Example

> **来源**: https://example.com/another
> **日期**: 2026-06-17 | **阅读时间**: 5 分钟 | **分类**: Product announcements

---

English paragraph.

中文段落。
`;

    const article = parseArticle("another-example.md", markdown);

    expect(article.sourceUrl).toBe("https://example.com/another");
    expect(article.publishedAt).toBe("2026-06-17");
    expect(article.category).toBe("Product announcements");
    expect(article.blocks).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      }
    ]);
  });

  it("parses list-style metadata lines before the separator", () => {
    const markdown = `# Claude Code now supports artifacts

- **Category**: Product announcements
- **Product**: Claude Code
- **Date**: June 18, 2026

---

English paragraph.

中文段落。
`;

    const article = parseArticle("artifacts.md", markdown);

    expect(article.publishedAt).toBe("June 18, 2026");
    expect(article.category).toBe("Product announcements");
  });

  it("records structural warnings for thematic breaks, tables, and code fences", () => {
    const markdown = `# Structural Example

---

English paragraph.

中文段落。

---

| Example | Usage |
| --- | --- |
| Row | Value |

\`\`\`ts
console.log("demo");
\`\`\`
`;

    const article = parseArticle("structural.md", markdown);

    expect(article.warnings).toEqual([
      {
        code: "thematic-break",
        message: 'Skipped thematic break in "structural".'
      },
      {
        code: "table",
        message: 'Skipped markdown table in "structural".'
      },
      {
        code: "code-fence",
        message: 'Skipped fenced code block in "structural".'
      }
    ]);
  });

  it("pairs localized mixed-language headings instead of leaving them standalone", () => {
    const markdown = `# Heading Example

---

## CLAUDE.md files

## CLAUDE.md 文件

English paragraph.

中文段落。
`;

    const article = parseArticle("heading-example.md", markdown);

    expect(article.blocks[0]).toEqual({
      type: "heading",
      level: 2,
      english: "CLAUDE.md files",
      chinese: "CLAUDE.md 文件"
    });
  });

  it("preserves unpaired mixed-language headings with explicit language", () => {
    const markdown = `# Mixed Heading Example

---

## Skills 的类型

English paragraph.

中文段落。
`;

    const article = parseArticle("mixed-heading.md", markdown);

    expect(article.blocks[0]).toEqual({
      type: "heading",
      level: 2,
      text: "Skills 的类型",
      language: "mixed"
    });
  });

  it("fails validation when same-level english and localized headings remain consecutive", () => {
    expect(() =>
      validateArticle({
        slug: "validation-example",
        title: "Validation Example",
        blocks: [
          {
            type: "heading",
            level: 2,
            text: "Skills",
            language: "en"
          },
          {
            type: "heading",
            level: 2,
            text: "Skills 的类型",
            language: "mixed"
          }
        ],
        warnings: []
      })
    ).toThrow(
      'Consecutive same-level standalone headings in "validation-example": "Skills" / "Skills 的类型"'
    );
  });

  it("throws when body content cannot be paired safely", () => {
    const markdown = `# Broken Example

---

English paragraph only.
`;

    expect(() => parseArticle("broken.md", markdown)).toThrow(
      "Unable to pair paragraph in broken"
    );
  });

  it("ignores body separators instead of treating them as paragraphs", () => {
    const markdown = `# Separator Example

---

English paragraph.

中文段落。

---

Another english paragraph.

另一段中文。
`;

    const article = parseArticle("separator.md", markdown);

    expect(article.blocks).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      },
      {
        type: "paragraph",
        id: "p-2",
        english: "Another english paragraph.",
        chinese: "另一段中文。"
      }
    ]);
    expect(article.warnings).toEqual([
      {
        code: "thematic-break",
        message: 'Skipped thematic break in "separator".'
      }
    ]);
  });

  it("splits adjacent list items into separate pairable paragraphs", () => {
    const markdown = `# List Example

---

- **Integrated terminal**: Run tests or builds alongside your session.
- **集成终端**：在会话旁边运行测试或构建。

- **Faster diff viewer**: Rebuilt for performance on large changesets.
- **更快的差异查看器**：针对大型变更集的性能进行了重建。
`;

    const article = parseArticle("list-example.md", markdown);

    expect(article.blocks).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "- **Integrated terminal**: Run tests or builds alongside your session.",
        chinese: "- **集成终端**：在会话旁边运行测试或构建。"
      },
      {
        type: "paragraph",
        id: "p-2",
        english: "- **Faster diff viewer**: Rebuilt for performance on large changesets.",
        chinese: "- **更快的差异查看器**：针对大型变更集的性能进行了重建。"
      }
    ]);
  });

  it("skips markdown table rows", () => {
    const markdown = `# Table Example

---

English paragraph.

中文段落。

| Example | Usage |
| --- | --- |
| Row | Value |

Another english paragraph.

另一段中文。
`;

    const article = parseArticle("table-example.md", markdown);

    expect(article.blocks).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      },
      {
        type: "paragraph",
        id: "p-2",
        english: "Another english paragraph.",
        chinese: "另一段中文。"
      }
    ]);
    expect(article.warnings).toEqual([
      {
        code: "table",
        message: 'Skipped markdown table in "table-example".'
      }
    ]);
  });

  it("splits adjacent ordered list items into separate pairable paragraphs", () => {
    const markdown = `# Ordered List Example

---

1. **Threat model:** Decide what counts as a vulnerability.
1. **威胁模型：** 定义什么算作漏洞。

2. **Sandbox:** Run agents safely and verify exploitability.
2. **沙箱：** 安全运行智能体并验证可利用性。
`;

    const article = parseArticle("ordered-list-example.md", markdown);

    expect(article.blocks).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "1. **Threat model:** Decide what counts as a vulnerability.",
        chinese: "1. **威胁模型：** 定义什么算作漏洞。"
      },
      {
        type: "paragraph",
        id: "p-2",
        english: "2. **Sandbox:** Run agents safely and verify exploitability.",
        chinese: "2. **沙箱：** 安全运行智能体并验证可利用性。"
      }
    ]);
  });
});
