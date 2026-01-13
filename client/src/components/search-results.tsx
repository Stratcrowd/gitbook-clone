import { Link } from "wouter";
import { FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Page, Collection } from "@shared/schema";

interface SearchResult {
  page: Page;
  collection: Collection;
  snippet: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  isLoading?: boolean;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="search-results-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12" data-testid="search-no-results">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-muted-foreground">
          Try searching with different keywords or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="search-results">
      <p className="text-sm text-muted-foreground">
        Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
      </p>
      
      {results.map((result) => (
        <Link
          key={result.page.id}
          href={`/${result.collection.slug}/${result.page.slug}`}
          className="block"
          data-testid={`search-result-${result.page.id}`}
        >
          <div className="p-4 border rounded-lg hover-elevate transition-all">
            <h3 className="font-medium text-lg mb-1">
              {highlightText(result.page.title, query)}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {result.collection.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {highlightText(result.snippet, query)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
