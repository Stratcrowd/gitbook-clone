import { Link } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText } from "lucide-react";
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

export default function ArticlesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories!inner(name, knowledge_bases!inner(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_articles"] });
    },
  });

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteArticle.mutateAsync(id);
      toast({
        title: "Article Deleted",
        description: `"${title}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
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
              <h1 className="text-3xl font-bold" data-testid="text-articles-list-title">
                Articles
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your documentation articles
              </p>
            </div>
            <Link href="/admin/articles/new">
              <Button data-testid="button-new-article">
                <Plus className="mr-2 h-4 w-4" />
                New Article
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
          ) : articles && articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article: any) => (
                <Card key={article.id} data-testid={`card-article-${article.id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{article.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {article.categories?.knowledge_bases?.name} / {article.categories?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={article.published ? "default" : "secondary"}>
                          {article.published ? "Published" : "Draft"}
                        </Badge>
                        <Link href={`/admin/articles/${article.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-article-${article.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-article-${article.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{article.title}" and all its sub-articles. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id, article.title)}>
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
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Articles</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first article to start adding documentation content.
                </p>
                <Link href="/admin/articles/new">
                  <Button data-testid="button-create-first-article">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Article
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
