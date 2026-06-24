import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./HomePage";

vi.mock("../lib/content/loaders", () => ({
  loadArticleIndex: () => [
    {
      id: "20260618",
      title: "June Release Notes",
      category: "Product announcements",
      product: "Claude Code",
      preview: "A roundup of June product updates."
    },
    {
      id: "20260610",
      title: "Managed Agents Guide",
      category: "Enterprise AI",
      product: "Claude Managed Agents",
      preview: "A field guide for teams deploying agents."
    },
    {
      id: "20260502",
      title: "Building on Apple platforms",
      category: "Developer guides",
      product: "Apple Foundation Models",
      preview: "How to build native workflows on Apple devices."
    }
  ]
}));

describe("HomePage", () => {
  it("keeps the library header compact and hides the descriptive hero copy", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.queryByText("English reader")).not.toBeInTheDocument();
    expect(
      screen.queryByText(/tap a paragraph for chinese, and browse the archive/i)
    ).not.toBeInTheDocument();
  });

  it("does not show the theme toggle on the library screen", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.queryByRole("button", { name: /switch to/i })).not.toBeInTheDocument();
  });

  it("filters articles by search query", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await user.type(screen.getByRole("searchbox", { name: /search articles/i }), "Apple");

    expect(screen.getByRole("heading", { name: "Building on Apple platforms" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "June Release Notes" })).not.toBeInTheDocument();
  });

  it("reveals sort and category controls only after opening filters", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.queryByRole("combobox", { name: /sort by/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: /filter by category/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open library filters/i }));

    expect(screen.getByRole("combobox", { name: /sort by/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /filter by category/i })).toBeInTheDocument();
  });

  it("sorts articles from oldest to newest", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /open library filters/i }));
    await user.selectOptions(screen.getByRole("combobox", { name: /sort by/i }), "oldest");

    const titles = within(screen.getByRole("list", { name: /article list/i })).getAllByRole(
      "heading",
      { level: 2 }
    );

    expect(titles.map((title) => title.textContent)).toEqual([
      "Building on Apple platforms",
      "Managed Agents Guide",
      "June Release Notes"
    ]);
  });

  it("filters articles by category and keeps the publication date visible", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /open library filters/i }));
    await user.selectOptions(screen.getByRole("combobox", { name: /filter by category/i }), "Enterprise AI");

    expect(screen.getByRole("heading", { name: "Managed Agents Guide" })).toBeInTheDocument();
    const article = screen.getByRole("listitem");
    expect(within(article).getByText("Date")).toBeInTheDocument();
    expect(within(article).getByText("Category")).toBeInTheDocument();
    expect(within(article).getByText("Product")).toBeInTheDocument();
    expect(within(article).getByText("2026-06-10")).toBeInTheDocument();
    expect(within(article).getByText("Enterprise AI")).toBeInTheDocument();
    expect(within(article).getByText("Claude Managed Agents")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "June Release Notes" })).not.toBeInTheDocument();
  });

  it("shows date, category, and product metadata as labels and values without the reading field", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const article = screen
      .getByRole("heading", { name: "June Release Notes" })
      .closest("article");

    expect(article).not.toBeNull();
    if (!article) {
      throw new Error("Expected article card");
    }

    const metadata = within(article).getByLabelText("Article metadata");
    expect(within(metadata).getByText("Date")).toBeInTheDocument();
    expect(within(metadata).getByText("Category")).toBeInTheDocument();
    expect(within(metadata).getByText("Product")).toBeInTheDocument();
    expect(within(metadata).getByText("2026-06-18")).toBeInTheDocument();
    expect(within(metadata).getByText("Product announcements")).toBeInTheDocument();
    expect(within(metadata).getByText("Claude Code")).toBeInTheDocument();
    expect(screen.queryByText("2026-06-18 | Product announcements | Claude Code")).not.toBeInTheDocument();
    expect(screen.queryByText("Reading")).not.toBeInTheDocument();
    expect(screen.queryByText("English with tap-to-translate")).not.toBeInTheDocument();
  });
});
