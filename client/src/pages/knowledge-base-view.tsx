import { useParams, Link } from "wouter";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBase } from "@/hooks/use-knowledge-base";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleWithChildren, CategoryWithArticles } from "@shared/types";

function ArticleTree({ articles, kbSlug, level = 0 }: { articles: ArticleWithChildren[]; kbSlug: string; level?: number }) {
  return (
    <ul className={cn("space-y-1", level > 0 && "ml-4 mt-1")}>
      {articles.map((article) => (
        <li key={article.id}>
          <Link href={`/${kbSlug}/${article.slug}`}>
            <span
              className="flex items-center gap-2 py-1.5 px-2 rounded-md text-sm hover:bg-muted cursor-pointer"
              data-testid={`link-article-${article.slug}`}
            >
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{article.title}</span>
            </span>
          </Link>
          {article.children && article.children.length > 0 && (
            <ArticleTree articles={article.children} kbSlug={kbSlug} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

function CategorySection({ category, kbSlug }: { category: CategoryWithArticles; kbSlug: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          {category.name}
        </h3>
      </div>
      {category.articles.length > 0 ? (
        <ArticleTree articles={category.articles} kbSlug={kbSlug} />
      ) : (
        <p className="text-sm text-muted-foreground pl-6">No articles yet</p>
      )}
    </div>
  );
}

export default function KnowledgeBaseView() {
  const { kbSlug } = useParams<{ kbSlug: string }>();
  const { data: kb, isLoading, error } = useKnowledgeBase(kbSlug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1">
          <aside className="w-64 border-r p-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-6 w-full mb-2" />
          </aside>
          <main className="flex-1 p-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </main>
        </div>
      </div>
    );
  }

  if (error || !kb) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Knowledge Base Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The knowledge base you're looking for doesn't exist.
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

  const firstArticle = kb.categories[0]?.articles[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1">
        <aside className="w-64 border-r overflow-y-auto p-4" data-testid="sidebar-nav">
          <div className="mb-6">
            <Link href="/">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
                <ChevronRight className="h-3 w-3 rotate-180" />
                Back to Home
              </span>
            </Link>
          </div>
          
          <h2 className="font-bold text-lg mb-4">{kb.name}</h2>
          
          {kb.categories.map((category) => (
            <CategorySection key={category.id} category={category} kbSlug={kbSlug || ""} />
          ))}
        </aside>

        <main className="flex-1 p-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-4" data-testid="text-kb-title">
            {kb.name}
          </h1>
          
          {kb.description && (
            <p className="text-lg text-muted-foreground mb-8">{kb.description}</p>
          )}

          {firstArticle ? (
            <div className="bg-muted/50 rounded-lg p-6">
              <h2 className="font-semibold mb-2">Get Started</h2>
              <p className="text-muted-foreground mb-4">
                Start reading the documentation by clicking on an article in the sidebar, or begin with:
              </p>
              <Link href={`/${kbSlug}/${firstArticle.slug}`}>
                <span className="text-primary hover:underline cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {firstArticle.title}
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No articles have been published yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
