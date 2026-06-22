import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ArticlePage from "./ArticlePage";

vi.mock("../lib/content/loaders", () => ({
  loadArticleBySlug: async () => ({
    slug: "demo-article",
    title: "Demo Article",
    blocks: [
      {
        type: "paragraph",
        id: "p-1",
        english: "First english paragraph.",
        chinese: "第一段中文。"
      }
    ],
    warnings: []
  })
}));

describe("ArticlePage", () => {
  it("shows a paragraph translation after the paragraph is selected", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/article/demo-article"]}>
        <Routes>
          <Route path="/article/:slug" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    const paragraphButton = await screen.findByRole("button", {
      name: /first english paragraph\./i
    });

    expect(screen.queryByText("第一段中文。")).not.toBeInTheDocument();

    await user.click(paragraphButton);

    expect(screen.getByText("第一段中文。")).toBeInTheDocument();
  });
});
