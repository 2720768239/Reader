import type { ArticleBlock } from "../lib/content/types";
import ParagraphBlock from "./ParagraphBlock";

type ArticleContentProps = {
  activeParagraphId: string | null;
  blocks: ArticleBlock[];
  onParagraphSelect: (chinese: string, paragraphId: string) => void;
};

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
  return (
    <section className="article-content">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return renderHeading(block, key);
        }

        if (block.type === "image") {
          return <img className="article-image" key={key} src={block.src} alt={block.alt} />;
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
  );
}
