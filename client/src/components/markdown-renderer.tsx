import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { getHeadingId } from "@/lib/heading-utils";
import { AlertCircle, Info, CheckCircle, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleCopy}
      data-testid="button-copy-code"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function Callout({ type, children }: { type: string; children: React.ReactNode }) {
  const variants = {
    info: {
      icon: Info,
      className: "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 text-blue-900 dark:text-blue-100",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 text-yellow-900 dark:text-yellow-100",
    },
    success: {
      icon: CheckCircle,
      className: "bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 text-green-900 dark:text-green-100",
    },
    error: {
      icon: AlertCircle,
      className: "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 text-red-900 dark:text-red-100",
    },
    note: {
      icon: Info,
      className: "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 text-blue-900 dark:text-blue-100",
    },
    tip: {
      icon: CheckCircle,
      className: "bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 text-green-900 dark:text-green-100",
    },
  };

  const variant = variants[type as keyof typeof variants] || variants.info;
  const Icon = variant.icon;

  return (
    <div className={cn("p-4 rounded-r-lg my-4 flex gap-3", variant.className)}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

function processCallouts(content: string): string {
  return content.replace(
    /:::(info|warning|success|error|note|tip)\n([\s\S]*?):::/g,
    (_, type, text) => `<callout type="${type}">${text.trim()}</callout>`
  );
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children;
  }
  if (typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return extractTextFromChildren((children as any).props.children);
  }
  return "";
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const processedContent = processCallouts(content);
  let headingIndex = 0;

  const getNextHeadingId = (text: string) => {
    const id = getHeadingId(String(text), headingIndex++);
    return id;
  };

  return (
    <article
      className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}
      data-testid="markdown-content"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ children }) => {
            const text = extractTextFromChildren(children);
            const id = getNextHeadingId(text);
            return (
              <h1 id={id} className="text-4xl font-bold mt-8 mb-4 first:mt-0 scroll-mt-20">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = extractTextFromChildren(children);
            const id = getNextHeadingId(text);
            return (
              <h2 id={id} className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b scroll-mt-20">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = extractTextFromChildren(children);
            const id = getNextHeadingId(text);
            return (
              <h3 id={id} className="text-xl font-semibold mt-6 mb-3 scroll-mt-20">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/30 pl-4 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            
            return (
              <code className={cn(className, "text-sm")} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => {
            const codeContent = (children as any)?.props?.children || "";
            const language = ((children as any)?.props?.className || "").replace("language-", "") || "text";
            
            return (
              <div className="relative group my-4">
                <div className="flex items-center justify-between bg-muted/80 dark:bg-muted/50 px-4 py-2 rounded-t-lg border border-b-0">
                  <span className="text-xs font-mono text-muted-foreground">
                    {language}
                  </span>
                </div>
                <pre className="bg-muted/50 dark:bg-muted/30 p-4 rounded-b-lg border overflow-x-auto !mt-0">
                  <CopyButton code={String(codeContent)} />
                  {children}
                </pre>
              </div>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b even:bg-muted/30">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="text-left px-4 py-2 font-medium">{children}</th>
          ),
          td: ({ children }) => <td className="px-4 py-2">{children}</td>,
          img: ({ src, alt }) => (
            <figure className="my-6">
              <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-md max-w-full mx-auto"
              />
              {alt && (
                <figcaption className="text-center text-sm italic text-muted-foreground mt-2">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-8 border-muted" />,
          callout: ({ type, children }: any) => (
            <Callout type={type}>{children}</Callout>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </article>
  );
}
