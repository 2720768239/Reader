import { useState } from "react";

import type { ArticleBlock } from "../lib/content/types";
import ParagraphBlock from "./ParagraphBlock";

type ArticleContentProps = {
  activeParagraphId: string | null;
  blocks: ArticleBlock[];
  onParagraphSelect: (chinese: string, paragraphId: string) => void;
};

function resolveImageSrc(src: string) {
  if (/^(?:https?:|data:|blob:|\/)/i.test(src)) {
    return src;
  }

  return `/${src.replace(/^\.?\//, "")}`;
}

function renderHeading(block: Extract<ArticleBlock, { type: "heading" }>, key: string) {
  const HeadingTag = `h${block.level}` as "h2" | "h3" | "h4" | "h5" | "h6";
  const headingText = "english" in block ? block.english : block.text;

  return <HeadingTag key={key}>{headingText}</HeadingTag>;
}

export default function ArticleContent({
  activeParagraphId,
  blocks,
  onParagraphSelect
}: ArticleContentProps) {
  const [expandedImage, setExpandedImage] = useState<{
    alt: string;
    src: string;
  } | null>(null);

  return (
    <>
      {expandedImage ? (
        <>
          <button
            aria-label="Close expanded image"
            className="reader-overlay reader-overlay--image"
            onClick={() => {
              setExpandedImage(null);
            }}
            type="button"
          />
          <div
            aria-label="Expanded image view"
            className="article-image-lightbox"
            role="dialog"
          >
            <button
              aria-label={`Shrink image: ${expandedImage.alt}`}
              className="article-image-lightbox__button"
              onClick={() => {
                setExpandedImage(null);
              }}
              type="button"
            >
              <img
                alt={`${expandedImage.alt} enlarged`}
                className="article-image article-image--expanded"
                src={expandedImage.src}
              />
            </button>
          </div>
        </>
      ) : null}

      <section className="article-content">
        {blocks.map((block, index) => {
          const key = `${block.type}-${index}`;

          if (block.type === "heading") {
            return renderHeading(block, key);
          }

          if (block.type === "image") {
            const imageSrc = resolveImageSrc(block.src);

            return (
              <button
                aria-label={`Expand image: ${block.alt}`}
                className="article-image-button"
                key={key}
                onClick={() => {
                  setExpandedImage({
                    alt: block.alt,
                    src: imageSrc
                  });
                }}
                type="button"
              >
                <img
                  alt={block.alt}
                  className="article-image"
                  src={imageSrc}
                />
              </button>
            );
          }

          if (block.type === "standalone") {
            return <p className="article-standalone" key={key}>{block.text}</p>;
          }

          return (
            <ParagraphBlock
              id={block.id}
              isActive={activeParagraphId === block.id}
              key={key}
              onSelect={() => onParagraphSelect(block.chinese, block.id)}
              text={block.english}
            />
          );
        })}
      </section>
    </>
  );
}
