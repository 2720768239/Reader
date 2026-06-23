import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./HomePage";

vi.mock("../lib/content/loaders", () => ({
  loadArticleIndex: () => [
    {
      slug: "june-update",
      title: "June Release Notes",
      publishedAt: "June 18, 2026",
      category: "Product announcements",
      preview: "A roundup of June product updates."
    },
    {
      slug: "agents-guide",
      title: "Managed Agents Guide",
      publishedAt: "June 10, 2026",
      category: "Enterprise AI",
      preview: "A field guide for teams deploying agents."
    },
    {
      slug: "apple-framework",
      title: "Building on Apple platforms",
      publishedAt: "May 2, 2026",
      category: "Developer guides",
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
    expect(screen.getByText("June 10, 2026")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "June Release Notes" })).not.toBeInTheDocument();
  });
});
