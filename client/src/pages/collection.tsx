import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarSkeleton, PageContentSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, FileText } from "lucide-react";
import type { CollectionWithContent, PageWithChildren, CategoryWithPages } from "@shared/schema";

function buildPageTree(pages: PageWithChildren[]): PageWithChildren[] {
  const pageMap = new Map<string, PageWithChildren>();
  const rootPages: PageWithChildren[] = [];

  pages.forEach((page) => {
    pageMap.set(page.id, { ...page, children: [] });
  });

  pages.forEach((page) => {
    const pageWithChildren = pageMap.get(page.id)!;
    if (page.parentId && pageMap.has(page.parentId)) {
      const parent = pageMap.get(page.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(pageWithChildren);
    } else if (!page.parentId) {
      rootPages.push(pageWithChildren);
    }
  });

  const sortPages = (pages: PageWithChildren[]): PageWithChildren[] => {
    return pages
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((page) => ({
        ...page,
        children: page.children ? sortPages(page.children) : [],
      }));
  };

  return sortPages(rootPages);
}

export default function Collection() {
  const [, params] = useRoute("/:collectionSlug");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: collection, isLoading } = useQuery<CollectionWithContent>({
    queryKey: ["/api/collections", params?.collectionSlug],
    enabled: !!params?.collectionSlug,
  });

  const { categories, uncategorizedPages } = useMemo(() => {
    if (!collection) return { categories: [], uncategorizedPages: [] };

    const publishedPages = collection.pages.filter((p) => p.published);
    
    const categorizedPageIds = new Set(
      publishedPages.filter((p) => p.categoryId).map((p) => p.id)
    );

    const categoriesWithPages: CategoryWithPages[] = (collection.categories || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((category) => ({
        ...category,
        pages: buildPageTree(
          publishedPages.filter((p) => p.categoryId === category.id)
        ),
      }));

    const uncategorized = buildPageTree(
      publishedPages.filter((p) => !p.categoryId && !p.parentId)
    );

    return { categories: categoriesWithPages, uncategorizedPages: uncategorized };
  }, [collection]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header showMenuButton onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <aside className="hidden md:block w-64 border-r">
            <SidebarSkeleton />
          </aside>
          <main className="flex-1 p-8">
            <PageContentSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Collection not found</h1>
            <p className="text-muted-foreground mb-4">
              The collection you're looking for doesn't exist.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">Back to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const firstPage = categories[0]?.pages[0] || uncategorizedPages[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showMenuButton onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="py-4 px-2 border-b">
              <h2 className="font-semibold px-2">{collection.title}</h2>
            </div>
            <SidebarNav
              collectionSlug={collection.slug}
              categories={categories}
              uncategorizedPages={uncategorizedPages}
            />
          </SheetContent>
        </Sheet>

        <aside className="hidden md:block w-64 border-r flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
          <div className="py-4 px-4 border-b">
            <h2 className="font-semibold">{collection.title}</h2>
          </div>
          <SidebarNav
            collectionSlug={collection.slug}
            categories={categories}
            uncategorizedPages={uncategorizedPages}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
            <Breadcrumbs
              items={[{ label: collection.title, href: `/${collection.slug}` }]}
              className="mb-6"
            />

            <h1 className="text-4xl font-bold mb-4" data-testid="text-collection-title">
              {collection.title}
            </h1>
            
            {collection.description && (
              <p className="text-lg text-muted-foreground mb-8">
                {collection.description}
              </p>
            )}

            {firstPage ? (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Get Started</h2>
                <Link href={`/${collection.slug}/${firstPage.slug}`}>
                  <div className="p-4 border rounded-lg hover-elevate transition-all flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{firstPage.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Start reading the documentation
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pages in this collection yet.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
