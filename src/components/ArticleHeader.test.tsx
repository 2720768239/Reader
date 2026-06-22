import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArticleHeader from "./ArticleHeader";

describe("ArticleHeader", () => {
  it("renders the title before the metadata", () => {
    render(
      <ArticleHeader category="Agents" publishedAt="June 10, 2026" title="Demo Article" />
    );

    const title = screen.getByRole("heading", { name: "Demo Article" });
    const meta = screen.getByText("June 10, 2026 | Agents");

    expect(title.compareDocumentPosition(meta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
