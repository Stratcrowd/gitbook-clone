import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
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
import type { Collection } from "@shared/schema";

export default function CollectionsList() {
  const { toast } = useToast();

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["/api/admin/collections"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/collections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/collections"] });
      toast({
        title: "Collection deleted",
        description: "The collection has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete collection.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-collections-title">
                Collections
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your documentation collections
              </p>
            </div>
            <Link href="/admin/collections/new">
              <Button data-testid="button-create-collection">
                <Plus className="mr-2 h-4 w-4" />
                New Collection
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <TableSkeleton />
          ) : collections && collections.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => (
                    <TableRow key={collection.id} data-testid={`row-collection-${collection.id}`}>
                      <TableCell className="font-medium">{collection.title}</TableCell>
                      <TableCell className="text-muted-foreground">/{collection.slug}</TableCell>
                      <TableCell>{collection.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/collections/${collection.id}`}>
                            <Button variant="ghost" size="icon" data-testid={`button-edit-${collection.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-delete-${collection.id}`}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{collection.title}"? This will also delete all categories and pages in this collection. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(collection.id)}
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
            <div className="text-center py-16 border rounded-lg" data-testid="collections-empty">
              <p className="text-muted-foreground mb-4">No collections yet.</p>
              <Link href="/admin/collections/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first collection
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
