import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { PageForm } from "@/components/admin/page-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Page, Collection, Category } from "@shared/schema";

export default function PageEdit() {
  const [, params] = useRoute("/admin/pages/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isNew = params?.id === "new";

  const { data: page, isLoading } = useQuery<Page>({
    queryKey: ["/api/admin/pages", params?.id],
    enabled: !isNew && !!params?.id,
  });

  const { data: collections } = useQuery<Collection[]>({
    queryKey: ["/api/admin/collections"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  const { data: pages } = useQuery<Page[]>({
    queryKey: ["/api/admin/pages"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/pages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page created",
        description: "The page has been created successfully.",
      });
      setLocation("/admin/pages");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create page.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/admin/pages/${params?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pages"] });
      toast({
        title: "Page updated",
        description: "The page has been updated successfully.",
      });
      setLocation("/admin/pages");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update page.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (values: any) => {
    if (isNew) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate(values);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation("/admin/pages")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pages
          </Button>

          <h1 className="text-3xl font-bold mb-8" data-testid="text-form-title">
            {isNew ? "Create Page" : "Edit Page"}
          </h1>

          {!isNew && isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <PageForm
              page={isNew ? undefined : page}
              collections={collections || []}
              categories={categories || []}
              pages={pages || []}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </div>
      </main>
    </div>
  );
}
