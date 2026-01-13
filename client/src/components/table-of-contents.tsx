import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const headingElements = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");
    
    const toc: TOCItem[] = [];
    headingElements.forEach((el, index) => {
      const level = parseInt(el.tagName[1]);
      const text = el.textContent || "";
      const id = `heading-${index}`;
      toc.push({ id, text, level });
    });

    setHeadings(toc);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav
      className={cn("space-y-1", className)}
      aria-label="Table of contents"
      data-testid="table-of-contents"
    >
      <p className="font-medium text-sm mb-3">On this page</p>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <button
              onClick={() => handleClick(heading.id)}
              style={{ paddingLeft: `${(heading.level - minLevel) * 12}px` }}
              className={cn(
                "text-sm text-left w-full py-1 transition-colors",
                activeId === heading.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid={`toc-${heading.id}`}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
