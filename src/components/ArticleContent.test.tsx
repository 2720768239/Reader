import { render, screen } from "@testing-library/react";
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
});
