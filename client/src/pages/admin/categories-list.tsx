import { Link } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Layers, FolderOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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

export default function CategoriesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin_categories_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, knowledge_bases!inner(name)")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories_list"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      toast({
        title: "Category Deleted",
        description: `"${name}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-categories-list-title">
                Categories
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize articles into categories
              </p>
            </div>
            <Link href="/admin/categories/new">
              <Button data-testid="button-new-category">
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category: any) => (
                <Card key={category.id} data-testid={`card-category-${category.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Layers className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{category.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {category.knowledge_bases?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/admin/categories/${category.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-category-${category.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-category-${category.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{category.name}" and all its articles. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(category.id, category.name)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Categories</h3>
                <p className="text-muted-foreground mb-4">
                  Create categories to organize your articles.
                </p>
                <Link href="/admin/categories/new">
                  <Button data-testid="button-create-first-category">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
