import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CategoryWithPages, PageWithChildren } from "@shared/schema";

interface SidebarNavProps {
  collectionSlug: string;
  categories: CategoryWithPages[];
  uncategorizedPages: PageWithChildren[];
  currentPageId?: string;
}

interface NavItemProps {
  page: PageWithChildren;
  collectionSlug: string;
  depth?: number;
  currentPageId?: string;
}

function NavItem({ page, collectionSlug, depth = 0, currentPageId }: NavItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = page.children && page.children.length > 0;
  const isActive = page.id === currentPageId;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1",
          depth > 0 && "ml-4"
        )}
      >
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`button-expand-${page.id}`}
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </Button>
        ) : (
          <div className="w-5 flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
        
        <Link
          href={`/${collectionSlug}/${page.slug}`}
          className={cn(
            "flex-1 text-sm py-1.5 px-2 rounded-md transition-colors",
            isActive
              ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          data-testid={`link-page-${page.id}`}
        >
          {page.title}
        </Link>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l ml-2.5 pl-0">
          {page.children!.map((child) => (
            <NavItem
              key={child.id}
              page={child}
              collectionSlug={collectionSlug}
              depth={depth + 1}
              currentPageId={currentPageId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CategorySectionProps {
  category: CategoryWithPages;
  collectionSlug: string;
  currentPageId?: string;
}

function CategorySection({ category, collectionSlug, currentPageId }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full text-left py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
        data-testid={`button-category-${category.id}`}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-90"
          )}
        />
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{category.title}</span>
      </button>

      {isExpanded && category.pages.length > 0 && (
        <div className="ml-2 mt-1">
          {category.pages.map((page) => (
            <NavItem
              key={page.id}
              page={page}
              collectionSlug={collectionSlug}
              currentPageId={currentPageId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ collectionSlug, categories, uncategorizedPages, currentPageId }: SidebarNavProps) {
  return (
    <ScrollArea className="h-full py-4">
      <nav className="px-4 space-y-2" data-testid="sidebar-nav">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            collectionSlug={collectionSlug}
            currentPageId={currentPageId}
          />
        ))}

        {uncategorizedPages.length > 0 && (
          <div className="mt-4">
            {uncategorizedPages.map((page) => (
              <NavItem
                key={page.id}
                page={page}
                collectionSlug={collectionSlug}
                currentPageId={currentPageId}
              />
            ))}
          </div>
        )}
      </nav>
    </ScrollArea>
  );
}
