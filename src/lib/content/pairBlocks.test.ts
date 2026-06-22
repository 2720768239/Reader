import { describe, expect, it } from "vitest";

import { pairBlocks } from "./pairBlocks";
import type { RawBlock } from "./types";

describe("pairBlocks", () => {
  it("pairs adjacent english and chinese paragraphs", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "English paragraph." },
      { type: "paragraph", text: "中文段落。" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      }
    ]);
  });

  it("pairs adjacent translated headings and preserves images", () => {
    const blocks: RawBlock[] = [
      { type: "heading", level: 2, text: "Heading" },
      { type: "heading", level: 2, text: "标题" },
      { type: "image", src: "images/demo.png", alt: "Demo" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "heading",
        level: 2,
        english: "Heading",
        chinese: "标题"
      },
      {
        type: "image",
        src: "images/demo.png",
        alt: "Demo"
      }
    ]);
  });

  it("pairs paragraphs across intervening images and preserves image order", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "English paragraph." },
      { type: "image", src: "images/demo.png", alt: "Demo" },
      { type: "paragraph", text: "中文段落。" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      },
      {
        type: "image",
        src: "images/demo.png",
        alt: "Demo"
      }
    ]);
  });

  it("throws when a paragraph cannot be paired safely", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "English paragraph." },
      { type: "heading", level: 2, text: "Section break" }
    ];

    expect(() => pairBlocks(blocks, { articleId: "demo-article" })).toThrow(
      "Unable to pair paragraph in demo-article"
    );
  });

  it("ignores a trailing chinese-only italic footer note", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "English paragraph." },
      { type: "paragraph", text: "中文段落。" },
      { type: "paragraph", text: "*仅中文尾注。*" }
    ];

    expect(pairBlocks(blocks, { articleId: "footer-demo" })).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "English paragraph.",
        chinese: "中文段落。"
      }
    ]);
  });

  it("keeps a standalone heading when no translation pair exists", () => {
    const blocks: RawBlock[] = [{ type: "heading", level: 2, text: "客户评价" }];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "heading",
        level: 2,
        text: "客户评价",
        language: "zh"
      }
    ]);
  });

  it("preserves mixed-language standalone headings explicitly", () => {
    const blocks: RawBlock[] = [{ type: "heading", level: 2, text: "CLAUDE.md 文件" }];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "heading",
        level: 2,
        text: "CLAUDE.md 文件",
        language: "mixed"
      }
    ]);
  });

  it("pairs english headings with localized mixed-language headings", () => {
    const blocks: RawBlock[] = [
      { type: "heading", level: 3, text: "CLAUDE.md files" },
      { type: "heading", level: 3, text: "CLAUDE.md 文件" },
      { type: "heading", level: 2, text: "Built on the context from your session" },
      { type: "heading", level: 2, text: "**基于会话上下文构建**" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "heading",
        level: 3,
        english: "CLAUDE.md files",
        chinese: "CLAUDE.md 文件"
      },
      {
        type: "heading",
        level: 2,
        english: "Built on the context from your session",
        chinese: "**基于会话上下文构建**"
      }
    ]);
  });

  it("pairs grouped english and chinese paragraph runs in order", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "- Item one in English." },
      { type: "paragraph", text: "- Item two in English." },
      { type: "paragraph", text: "- 条目一中文。" },
      { type: "paragraph", text: "- 条目二中文。" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "- Item one in English.",
        chinese: "- 条目一中文。"
      },
      {
        type: "paragraph",
        id: "p-2",
        english: "- Item two in English.",
        chinese: "- 条目二中文。"
      }
    ]);
  });

  it("preserves standalone paragraphs inside a monolingual section", () => {
    const blocks: RawBlock[] = [
      { type: "heading", level: 2, text: "附录：技能文件骨架模板" },
      { type: "paragraph", text: "以下是他们主要仓库技能的骨架。" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "heading",
        level: 2,
        text: "附录：技能文件骨架模板",
        language: "zh"
      },
      {
        type: "standalone",
        text: "以下是他们主要仓库技能的骨架。",
        language: "zh"
      }
    ]);
  });

  it("treats mixed technical text by dominant language", () => {
    const blocks: RawBlock[] = [
      {
        type: "paragraph",
        text: "Feed the model what you would hand a new security工程师 on day one."
      },
      {
        type: "paragraph",
        text: "将你在第一天会交给新安全工程师的资料提供给模型：架构文档、git 历史记录和过去的漏洞。"
      }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "Feed the model what you would hand a new security工程师 on day one.",
        chinese: "将你在第一天会交给新安全工程师的资料提供给模型：架构文档、git 历史记录和过去的漏洞。"
      }
    ]);
  });

  it("classifies chinese bullets that start with english product names", () => {
    const blocks: RawBlock[] = [
      {
        type: "paragraph",
        text: "- **Notion** runs its Custom Agents on Managed Agents."
      },
      {
        type: "paragraph",
        text: "- **Notion** 在 Managed Agents 上运行其自定义智能体，团队直接从任务面板将工作分配给 Claude。"
      }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "- **Notion** runs its Custom Agents on Managed Agents.",
        chinese: "- **Notion** 在 Managed Agents 上运行其自定义智能体，团队直接从任务面板将工作分配给 Claude。"
      }
    ]);
  });

  it("classifies short chinese lines with english prefixes via chinese punctuation", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "Managed Agents includes:" },
      { type: "paragraph", text: "Managed Agents 包含以下特性：" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "Managed Agents includes:",
        chinese: "Managed Agents 包含以下特性："
      }
    ]);
  });

  it("preserves a terminal monolingual paragraph run as standalone blocks", () => {
    const blocks: RawBlock[] = [
      { type: "paragraph", text: "Some resources you might find helpful:" },
      { type: "paragraph", text: "一些你可能觉得有用的资源：" },
      { type: "paragraph", text: "- **Claude Security:** Anthropic 的托管产品，用于智能体漏洞检测和修补。" },
      { type: "paragraph", text: "- **Vulnerability Detection Agent:** Cookbook，构建一个扫描漏洞的智能体。" }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "paragraph",
        id: "p-1",
        english: "Some resources you might find helpful:",
        chinese: "一些你可能觉得有用的资源："
      },
      {
        type: "standalone",
        text: "- **Claude Security:** Anthropic 的托管产品，用于智能体漏洞检测和修补。",
        language: "zh"
      },
      {
        type: "standalone",
        text: "- **Vulnerability Detection Agent:** Cookbook，构建一个扫描漏洞的智能体。",
        language: "zh"
      }
    ]);
  });

  it("preserves a single standalone markdown-link paragraph", () => {
    const blocks: RawBlock[] = [
      {
        type: "paragraph",
        text: "📹 [See your projects differently with Artifacts in Claude Code](https://www.youtube.com/watch?v=artifacts-claude-code)"
      }
    ];

    expect(pairBlocks(blocks)).toEqual([
      {
        type: "standalone",
        text: "📹 [See your projects differently with Artifacts in Claude Code](https://www.youtube.com/watch?v=artifacts-claude-code)",
        language: "en"
      }
    ]);
  });

  it("ignores a trailing italic source note", () => {
    const blocks: RawBlock[] = [{ type: "paragraph", text: "*Source: https://example.com/post*" }];

    expect(pairBlocks(blocks)).toEqual([]);
  });

  it("does not throw when same-level english and localized headings are paired", () => {
    const blocks: RawBlock[] = [
      { type: "heading", level: 2, text: "Skills" },
      { type: "heading", level: 2, text: "Skills 的类型" }
    ];

    expect(() =>
      pairBlocks(blocks, {
        articleId: "heading-validation-demo"
      })
    ).not.toThrow();
  });
});
