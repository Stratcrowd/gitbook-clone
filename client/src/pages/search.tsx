import { useSearch as useWouterSearch } from "wouter";
import { Header } from "@/components/header";
import { useSearch } from "@/hooks/use-knowledge-base";
import { Link } from "wouter";
import { FileText, Search as SearchIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function Search() {
  const searchString = useWouterSearch();
  const params = new URLSearchParams(searchString);
  const query = params.get("q") || "";

  const { data: results, isLoading } = useSearch(query);

  const { data: categories } = useQuery({
    queryKey: ["search_categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, knowledge_base_id, knowledge_bases!inner(slug)");
      return data || [];
    },
    enabled: !!results?.length,
  });

  const getKbSlug = (categoryId: string) => {
    const cat = categories?.find((c: any) => c.id === categoryId);
    return cat?.knowledge_bases?.slug || "";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2" data-testid="text-search-title">
            Search Results
          </h1>
          {query && (
            <p className="text-muted-foreground mb-6">
              Showing results for "{query}"
            </p>
          )}

          {!query ? (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Enter a search query to find documentation.
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              ))}
            </div>
          ) : results && results.length > 0 ? (
            <div className="space-y-4">
              {results.map((article) => {
                const kbSlug = getKbSlug(article.category_id);
                return (
                  <Link 
                    key={article.id} 
                    href={kbSlug ? `/${kbSlug}/${article.slug}` : "#"}
                  >
                    <div 
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      data-testid={`result-${article.id}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{article.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-muted-foreground">
                Try a different search term or browse the documentation.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
