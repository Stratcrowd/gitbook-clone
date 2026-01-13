import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { CollectionForm } from "@/components/admin/collection-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Collection } from "@shared/schema";

export default function CollectionEdit() {
  const [, params] = useRoute("/admin/collections/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isNew = params?.id === "new";

  const { data: collection, isLoading } = useQuery<Collection>({
    queryKey: ["/api/admin/collections", params?.id],
    enabled: !isNew && !!params?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/collections", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/collections"] });
      toast({
        title: "Collection created",
        description: "The collection has been created successfully.",
      });
      setLocation("/admin/collections");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create collection.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/admin/collections/${params?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/collections"] });
      toast({
        title: "Collection updated",
        description: "The collection has been updated successfully.",
      });
      setLocation("/admin/collections");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update collection.",
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
        <div className="p-8 max-w-2xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => setLocation("/admin/collections")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collections
          </Button>

          <h1 className="text-3xl font-bold mb-8" data-testid="text-form-title">
            {isNew ? "Create Collection" : "Edit Collection"}
          </h1>

          {!isNew && isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <CollectionForm
              collection={isNew ? undefined : collection}
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </div>
      </main>
    </div>
  );
}
