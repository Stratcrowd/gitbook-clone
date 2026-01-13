import { Link } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { useKnowledgeBases, useDeleteKnowledgeBase } from "@/hooks/use-knowledge-base";
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

export default function KnowledgeBasesList() {
  const { data: knowledgeBases, isLoading } = useKnowledgeBases();
  const deleteKb = useDeleteKnowledgeBase();
  const { toast } = useToast();

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteKb.mutateAsync(id);
      toast({
        title: "Knowledge Base Deleted",
        description: `"${name}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete knowledge base. Please try again.",
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
              <h1 className="text-3xl font-bold" data-testid="text-kb-list-title">
                Knowledge Bases
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your documentation knowledge bases
              </p>
            </div>
            <Link href="/admin/knowledge-bases/new">
              <Button data-testid="button-new-kb">
                <Plus className="mr-2 h-4 w-4" />
                New Knowledge Base
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : knowledgeBases && knowledgeBases.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {knowledgeBases.map((kb) => (
                <Card key={kb.id} data-testid={`card-kb-${kb.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        {kb.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Link href={`/admin/knowledge-bases/${kb.id}`}>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-kb-${kb.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-delete-kb-${kb.id}`}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Knowledge Base?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{kb.name}" and all its categories and articles. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(kb.id, kb.name)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {kb.description || "No description"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Slug: /{kb.slug}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Knowledge Bases</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first knowledge base to start organizing documentation.
                </p>
                <Link href="/admin/knowledge-bases/new">
                  <Button data-testid="button-create-first-kb">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Knowledge Base
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
