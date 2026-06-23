import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArticleHeader from "./ArticleHeader";

describe("ArticleHeader", () => {
  it("renders the title before the metadata", () => {
    render(
      <ArticleHeader
        category="Agents"
        product="Claude Managed Agents"
        publishedAt="June 10, 2026"
        title="Demo Article"
      />
    );

    const title = screen.getByRole("heading", { name: "Demo Article" });
    const meta = screen.getByLabelText("Article metadata");

    expect(title.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(meta).getByText("Date")).toBeInTheDocument();
    expect(within(meta).getByText("Category")).toBeInTheDocument();
    expect(within(meta).getByText("Product")).toBeInTheDocument();
    expect(within(meta).getByText("June 10, 2026")).toBeInTheDocument();
    expect(within(meta).getByText("Agents")).toBeInTheDocument();
    expect(within(meta).getByText("Claude Managed Agents")).toBeInTheDocument();
    expect(screen.queryByText("June 10, 2026 | Agents | Claude Managed Agents")).not.toBeInTheDocument();
  });
});
