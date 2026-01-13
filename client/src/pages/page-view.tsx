import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TableOfContents } from "@/components/table-of-contents";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { PrevNextNav } from "@/components/prev-next-nav";
import { SidebarSkeleton, PageContentSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { CollectionWithContent, Page, PageWithChildren, CategoryWithPages } from "@shared/schema";

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

function flattenPages(pages: PageWithChildren[]): Page[] {
  const result: Page[] = [];
  const traverse = (pages: PageWithChildren[]) => {
    pages.forEach((page) => {
      result.push(page);
      if (page.children && page.children.length > 0) {
        traverse(page.children);
      }
    });
  };
  traverse(pages);
  return result;
}

export default function PageView() {
  const [, params] = useRoute("/:collectionSlug/:pageSlug");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: collection, isLoading: collectionLoading } = useQuery<CollectionWithContent>({
    queryKey: ["/api/collections", params?.collectionSlug],
    enabled: !!params?.collectionSlug,
  });

  const { data: page, isLoading: pageLoading } = useQuery<Page>({
    queryKey: ["/api/pages", params?.collectionSlug, params?.pageSlug],
    enabled: !!params?.collectionSlug && !!params?.pageSlug,
  });

  const { categories, uncategorizedPages, allPages, currentIndex, prevPage, nextPage } = useMemo(() => {
    if (!collection) return { categories: [], uncategorizedPages: [], allPages: [], currentIndex: -1, prevPage: null, nextPage: null };

    const publishedPages = collection.pages.filter((p) => p.published);

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

    const allFlat: Page[] = [];
    categoriesWithPages.forEach((cat) => {
      allFlat.push(...flattenPages(cat.pages));
    });
    allFlat.push(...flattenPages(uncategorized));

    const idx = page ? allFlat.findIndex((p) => p.id === page.id) : -1;

    return {
      categories: categoriesWithPages,
      uncategorizedPages: uncategorized,
      allPages: allFlat,
      currentIndex: idx,
      prevPage: idx > 0 ? allFlat[idx - 1] : null,
      nextPage: idx >= 0 && idx < allFlat.length - 1 ? allFlat[idx + 1] : null,
    };
  }, [collection, page]);

  const breadcrumbItems = useMemo(() => {
    if (!collection || !page) return [];
    
    const items = [{ label: collection.title, href: `/${collection.slug}` }];
    
    if (page.categoryId) {
      const category = collection.categories?.find((c) => c.id === page.categoryId);
      if (category) {
        items.push({ label: category.title });
      }
    }
    
    items.push({ label: page.title });
    
    return items;
  }, [collection, page]);

  const isLoading = collectionLoading || pageLoading;

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

  if (!collection || !page) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Page not found</h1>
            <p className="text-muted-foreground mb-4">
              The page you're looking for doesn't exist.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">Back to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
              currentPageId={page.id}
            />
          </SheetContent>
        </Sheet>

        <aside className="hidden md:block w-64 border-r flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
          <div className="py-4 px-4 border-b">
            <Link href={`/${collection.slug}`} className="font-semibold hover:text-primary transition-colors">
              {collection.title}
            </Link>
          </div>
          <SidebarNav
            collectionSlug={collection.slug}
            categories={categories}
            uncategorizedPages={uncategorizedPages}
            currentPageId={page.id}
          />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-4 py-8 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            <article>
              <h1 className="text-4xl font-bold mb-6" data-testid="text-page-title">
                {page.title}
              </h1>

              <MarkdownRenderer content={page.content || ""} />

              <PrevNextNav
                collectionSlug={collection.slug}
                prevPage={prevPage}
                nextPage={nextPage}
              />
            </article>
          </div>
        </main>

        <aside className="hidden xl:block w-60 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-auto py-8 px-4">
          <TableOfContents content={page.content || ""} />
        </aside>
      </div>
    </div>
  );
}
