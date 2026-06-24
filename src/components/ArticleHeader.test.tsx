import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArticleHeader from "./ArticleHeader";

describe("ArticleHeader", () => {
  it("renders the title before the metadata", () => {
    render(
      <ArticleHeader
        category="Agents"
        id="20260610"
        product="Claude Managed Agents"
        sourceUrl="https://example.com/demo"
        title="Demo Article"
      />
    );

    const title = screen.getByRole("heading", { name: "Demo Article" });
    const meta = screen.getByLabelText("Article metadata");

    expect(title.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(meta).getByText("Date")).toBeInTheDocument();
    expect(within(meta).getByText("Category")).toBeInTheDocument();
    expect(within(meta).getByText("Product")).toBeInTheDocument();
    expect(within(meta).getByText("Source")).toBeInTheDocument();
    expect(within(meta).getByText("2026-06-10")).toBeInTheDocument();
    expect(within(meta).getByText("Agents")).toBeInTheDocument();
    expect(within(meta).getByText("Claude Managed Agents")).toBeInTheDocument();
    expect(within(meta).getByRole("link", { name: "原文" })).toHaveAttribute(
      "href",
      "https://example.com/demo"
    );
    expect(
      screen.queryByText("2026-06-10 | Agents | Claude Managed Agents")
    ).not.toBeInTheDocument();
  });
});
