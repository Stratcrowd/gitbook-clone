import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useKnowledgeBases } from "@/hooks/use-knowledge-base";
import { Link } from "wouter";

export default function CategoryEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [knowledgeBaseId, setKnowledgeBaseId] = useState("");

  const { data: knowledgeBases } = useKnowledgeBases();

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["admin_category", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setSlug(category.slug || "");
      setDescription(category.description || "");
      setKnowledgeBaseId(category.knowledge_base_id || "");
    }
  }, [category]);

  const createCategory = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("categories")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories_list"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_categories_list"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });

  const isSaving = createCategory.isPending || updateCategory.isPending;

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (isNew) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!knowledgeBaseId) {
      toast({
        title: "Error",
        description: "Please select a knowledge base.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        name,
        slug,
        description: description || null,
        knowledge_base_id: knowledgeBaseId,
        order_index: 0,
      };

      if (isNew) {
        await createCategory.mutateAsync(data);
        toast({
          title: "Category Created",
          description: `"${name}" has been created successfully.`,
        });
      } else {
        await updateCategory.mutateAsync({ id, ...data });
        toast({
          title: "Category Updated",
          description: `"${name}" has been updated successfully.`,
        });
      }
      setLocation("/admin/categories");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isNew ? "create" : "update"} category.`,
        variant: "destructive",
      });
    }
  };

  if (!isNew && categoryLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-2xl">
          <div className="mb-8">
            <Link href="/admin/categories">
              <Button variant="ghost" className="mb-4" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
            </Link>
            <h1 className="text-3xl font-bold" data-testid="text-category-edit-title">
              {isNew ? "Create Category" : "Edit Category"}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="kb">Knowledge Base</Label>
                  <Select value={knowledgeBaseId} onValueChange={setKnowledgeBaseId}>
                    <SelectTrigger data-testid="select-kb">
                      <SelectValue placeholder="Select a knowledge base" />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeBases?.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>
                          {kb.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Getting Started"
                    required
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g., getting-started"
                    required
                    data-testid="input-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this category"
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSaving} data-testid="button-save">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isNew ? "Create" : "Save Changes"}
                      </>
                    )}
                  </Button>
                  <Link href="/admin/categories">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
