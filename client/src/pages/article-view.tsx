import { useParams, Link } from "wouter";
import { useMemo } from "react";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBase, useArticle } from "@/hooks/use-knowledge-base";
import { TableOfContents } from "@/components/table-of-contents";
import { ChevronRight, FileText, FolderOpen, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleWithChildren, CategoryWithArticles } from "@shared/types";

function addHeadingIds(htmlContent: string): string {
  if (!htmlContent) return "";
  
  let headingIndex = 0;
  return htmlContent.replace(
    /<(h[1-6])([^>]*)>/gi,
    (match, tag, attrs) => {
      const id = `heading-${headingIndex++}`;
      if (attrs.includes("id=")) {
        return match;
      }
      return `<${tag}${attrs} id="${id}">`;
    }
  );
}

function ArticleTree({ articles, kbSlug, currentSlug, level = 0 }: { 
  articles: ArticleWithChildren[]; 
  kbSlug: string; 
  currentSlug: string;
  level?: number;
}) {
  return (
    <ul className={cn("space-y-1", level > 0 && "ml-4 mt-1")}>
      {articles.map((article) => (
        <li key={article.id}>
          <Link href={`/${kbSlug}/${article.slug}`}>
            <span
              className={cn(
                "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm cursor-pointer",
                article.slug === currentSlug 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-muted"
              )}
              data-testid={`link-article-${article.slug}`}
            >
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{article.title}</span>
            </span>
          </Link>
          {article.children && article.children.length > 0 && (
            <ArticleTree 
              articles={article.children} 
              kbSlug={kbSlug} 
              currentSlug={currentSlug}
              level={level + 1} 
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function Sidebar({ kb, kbSlug, currentSlug }: { 
  kb: { name: string; categories: CategoryWithArticles[] }; 
  kbSlug: string;
  currentSlug: string;
}) {
  return (
    <aside className="w-64 border-r overflow-y-auto p-4 flex-shrink-0" data-testid="sidebar-nav">
      <div className="mb-6">
        <Link href="/">
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
            <Home className="h-3 w-3" />
            Home
          </span>
        </Link>
      </div>
      
      <Link href={`/${kbSlug}`}>
        <h2 className="font-bold text-lg mb-4 hover:text-primary cursor-pointer">{kb.name}</h2>
      </Link>
      
      {kb.categories.map((category) => (
        <div key={category.id} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              {category.name}
            </h3>
          </div>
          {category.articles.length > 0 && (
            <ArticleTree 
              articles={category.articles} 
              kbSlug={kbSlug} 
              currentSlug={currentSlug}
            />
          )}
        </div>
      ))}
    </aside>
  );
}

export default function ArticleView() {
  const { kbSlug, articleSlug } = useParams<{ kbSlug: string; articleSlug: string }>();
  const { data: kb, isLoading: kbLoading } = useKnowledgeBase(kbSlug || "");
  const { data: article, isLoading: articleLoading, error } = useArticle(kbSlug || "", articleSlug || "");

  const isLoading = kbLoading || articleLoading;
  
  const processedContent = useMemo(() => {
    if (!article?.content) return "";
    return addHeadingIds(article.content);
  }, [article?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <aside className="w-64 border-r p-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
          </aside>
          <main className="flex-1 p-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
          </main>
        </div>
      </div>
    );
  }

  if (error || !article || !kb) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The article you're looking for doesn't exist or hasn't been published.
            </p>
            <Link href="/">
              <span className="text-primary hover:underline cursor-pointer">
                Return to Home
              </span>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar kb={kb} kbSlug={kbSlug || ""} currentSlug={articleSlug || ""} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6" data-testid="breadcrumb">
              <Link href="/">
                <span className="hover:text-foreground cursor-pointer">Home</span>
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/${kbSlug}`}>
                <span className="hover:text-foreground cursor-pointer">{kb.name}</span>
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground">{article.title}</span>
            </nav>

            <article>
              <h1 className="text-3xl font-bold mb-6" data-testid="text-article-title">
                {article.title}
              </h1>
              
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </article>
          </div>
        </main>

        <aside className="w-56 border-l p-4 overflow-y-auto hidden lg:block">
          <TableOfContents content={processedContent} />
        </aside>
      </div>
    </div>
  );
}
