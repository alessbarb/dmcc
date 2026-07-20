import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "../styles/features/markdown-content.css";

export type MarkdownContentProps = {
  value?: string | null;
  className?: string;
  compact?: boolean;
};

export function MarkdownContent({ value, className, compact = false }: MarkdownContentProps) {
  if (!value?.trim()) return null;

  const classes = ["markdown-content", compact && "markdown-content--compact", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        skipHtml
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
