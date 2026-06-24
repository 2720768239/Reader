import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ArticlePage from "./ArticlePage";

vi.mock("../lib/content/loaders", () => ({
  loadArticleById: async () => ({
    id: "20260610",
    title: "Demo Article",
    sourceUrl: "https://example.com/demo",
    category: "Enterprise AI",
    product: "Claude Managed Agents",
    preview: "First english paragraph.",
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
          <Route path="/article/:id" element={<ArticlePage />} />
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

  it("opens and closes the reading controls from the top bar", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter initialEntries={["/article/demo-article"]}>
        <Routes>
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(
      await screen.findByRole("button", { name: /open reading settings/i })
    );

    expect(screen.getByText("Text size")).toBeInTheDocument();

    const articleShell = container.querySelector(".page-shell--reader");
    expect(articleShell).toBeInTheDocument();
    expect(articleShell).toHaveClass("reader-font-md", "reader-spacing-relaxed");

    await user.click(screen.getByRole("button", { name: "A+" }));
    await user.click(screen.getByRole("button", { name: "Wide" }));

    expect(articleShell).toHaveClass("reader-font-lg", "reader-spacing-airy");

    await user.click(screen.getByRole("button", { name: /close reading settings/i }));

    expect(screen.queryByText("Text size")).not.toBeInTheDocument();
  });

  it("keeps the theme button available while the reading controls are open", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/article/demo-article"]}>
        <Routes>
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(
      await screen.findByRole("button", { name: /open reading settings/i })
    );

    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
    expect(screen.getByText("Text size")).toBeInTheDocument();
  });

  it("hides the top bar while scrolling and restores it when the paper background is tapped", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter initialEntries={["/article/demo-article"]}>
        <Routes>
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByRole("button", { name: /first english paragraph\./i });

    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 3200
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 240,
      writable: true
    });

    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(container.querySelector(".topbar--hidden")).toBeInTheDocument();

    const readerSurface = container.querySelector(".reader-surface");
    expect(readerSurface).not.toBeNull();
    if (!readerSurface) {
      throw new Error("Expected reader surface");
    }

    await user.click(readerSurface);

    expect(container.querySelector(".topbar--hidden")).not.toBeInTheDocument();
  });

  it("shows date, category, product, and source metadata as labels and values", async () => {
    render(
      <MemoryRouter initialEntries={["/article/demo-article"]}>
        <Routes>
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>
    );

    const metadata = await screen.findByLabelText("Article metadata");

    expect(within(metadata).getByText("Date")).toBeInTheDocument();
    expect(within(metadata).getByText("Category")).toBeInTheDocument();
    expect(within(metadata).getByText("Product")).toBeInTheDocument();
    expect(within(metadata).getByText("Source")).toBeInTheDocument();
    expect(within(metadata).getByText("2026-06-10")).toBeInTheDocument();
    expect(within(metadata).getByText("Enterprise AI")).toBeInTheDocument();
    expect(within(metadata).getByText("Claude Managed Agents")).toBeInTheDocument();
    expect(within(metadata).getByRole("link", { name: "原文" })).toHaveAttribute(
      "href",
      "https://example.com/demo"
    );
    expect(
      screen.queryByText("2026-06-10 | Enterprise AI | Claude Managed Agents")
    ).not.toBeInTheDocument();
  });
});
