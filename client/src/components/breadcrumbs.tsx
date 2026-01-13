import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      aria-label="Breadcrumb"
      data-testid="breadcrumbs"
    >
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
        data-testid="breadcrumb-home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
              data-testid={`breadcrumb-${index}`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                index === items.length - 1 && "text-foreground font-medium"
              )}
              data-testid={`breadcrumb-${index}`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
