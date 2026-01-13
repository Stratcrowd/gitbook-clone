import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Page } from "@shared/schema";

interface PrevNextNavProps {
  collectionSlug: string;
  prevPage?: Page | null;
  nextPage?: Page | null;
}

export function PrevNextNav({ collectionSlug, prevPage, nextPage }: PrevNextNavProps) {
  if (!prevPage && !nextPage) {
    return null;
  }

  return (
    <nav
      className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t"
      data-testid="prev-next-nav"
    >
      {prevPage ? (
        <Link
          href={`/${collectionSlug}/${prevPage.slug}`}
          className="flex-1 group"
          data-testid="link-prev-page"
        >
          <div className="flex items-center gap-2 p-4 rounded-lg border hover-elevate transition-all">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Previous</p>
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {prevPage.title}
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {nextPage ? (
        <Link
          href={`/${collectionSlug}/${nextPage.slug}`}
          className="flex-1 group"
          data-testid="link-next-page"
        >
          <div className="flex items-center gap-2 p-4 rounded-lg border hover-elevate transition-all text-right">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Next</p>
              <p className="font-medium truncate group-hover:text-primary transition-colors">
                {nextPage.title}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
