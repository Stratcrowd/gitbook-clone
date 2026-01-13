import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ImportMarkdownDialog } from "@/components/admin/import-markdown-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Page, Collection, Category } from "@shared/schema";

export default function PagesList() {
  const { toast } = useToast();

  const { data: pages, isLoading } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
  });

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["/api/admin/collections"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  const getCollectionTitle = (collectionId: string) => {
    return collections?.find((c) => c.id === collectionId)?.title || "Unknown";
  };

  const getCategoryTitle = (categoryId: string | null) => {
    if (!categoryId) return "-";
    return categories?.find((c) => c.id === categoryId)?.title || "Unknown";
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page.",
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      collectionId: string;
      categoryId?: string;
    }) => {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      const res = await apiRequest("POST", "/api/admin/pages", {
        ...data,
        slug,
        published: false,
        order: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page imported",
        description: "The markdown content has been imported as a new page.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to import page.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-pages-title">
                Pages
              </h1>
              <p className="text-muted-foreground mt-1">
                Create and manage documentation pages
              </p>
            </div>
            <div className="flex gap-3">
              <ImportMarkdownDialog
                collections={collections || []}
                categories={categories || []}
                onImport={importMutation.mutate}
                isLoading={importMutation.isPending}
              />
              <Link href="/admin/pages/new">
                <Button data-testid="button-create-page">
                  <Plus className="mr-2 h-4 w-4" />
                  New Page
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : pages && pages.length > 0 ? (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id} data-testid={`row-page-${page.id}`}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCollectionTitle(page.collectionId)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCategoryTitle(page.categoryId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.published ? "default" : "secondary"}>
                          {page.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>{page.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/pages/${page.id}`}>
                            <Button variant="ghost" size="icon" data-testid={`button-edit-${page.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-${page.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Page</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{page.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(page.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border rounded-lg" data-testid="pages-empty">
              <p className="text-muted-foreground mb-4">No pages yet.</p>
              <Link href="/admin/pages/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first page
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
