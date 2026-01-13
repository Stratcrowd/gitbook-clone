import { Skeleton } from "@/components/ui/skeleton";

export function CollectionCardSkeleton() {
  return (
    <div className="h-full p-6 border rounded-lg">
      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <div className="ml-4 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageContentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-4">
        <Skeleton className="h-6 w-1/2 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted p-3">
        <Skeleton className="h-5 w-full" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 border-t">
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
