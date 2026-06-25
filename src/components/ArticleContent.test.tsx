import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ArticleContent from "./ArticleContent";

describe("ArticleContent", () => {
  it("resolves relative image sources from the site root", () => {
    render(
      <ArticleContent
        activeParagraphId={null}
        blocks={[
          {
            type: "image",
            src: "images/demo-figure.png",
            alt: "Demo figure"
          }
        ]}
        onParagraphSelect={() => undefined}
      />
    );

    expect(screen.getByRole("img", { name: "Demo figure" })).toHaveAttribute(
      "src",
      "/images/demo-figure.png"
    );
  });

  it("opens an enlarged image view when an article image is clicked and closes it again", async () => {
    const user = userEvent.setup();

    render(
      <ArticleContent
        activeParagraphId={null}
        blocks={[
          {
            type: "image",
            src: "images/demo-figure.png",
            alt: "Demo figure"
          }
        ]}
        onParagraphSelect={() => undefined}
      />
    );

    expect(screen.queryByRole("dialog", { name: "Expanded image view" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expand image: Demo figure" }));

    expect(screen.getByRole("dialog", { name: "Expanded image view" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Demo figure enlarged" })).toHaveAttribute(
      "src",
      "/images/demo-figure.png"
    );

    await user.click(screen.getByRole("button", { name: "Shrink image: Demo figure" }));

    expect(screen.queryByRole("dialog", { name: "Expanded image view" })).not.toBeInTheDocument();
  });
});
