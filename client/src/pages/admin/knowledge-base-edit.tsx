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
import { useCreateKnowledgeBase, useUpdateKnowledgeBase } from "@/hooks/use-knowledge-base";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const icons = ["Book", "Cpu", "Bot", "Wifi", "FileText", "Folder"];

export default function KnowledgeBaseEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isNew = !id || id === "new";

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Book");

  const { data: kb, isLoading: kbLoading } = useQuery({
    queryKey: ["knowledge_base", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("knowledge_bases")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (kb) {
      setName(kb.name || "");
      setSlug(kb.slug || "");
      setDescription(kb.description || "");
      setIcon(kb.icon || "Book");
    }
  }, [kb]);

  const createKb = useCreateKnowledgeBase();
  const updateKb = useUpdateKnowledgeBase();
  const isSaving = createKb.isPending || updateKb.isPending;

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

    try {
      if (isNew) {
        await createKb.mutateAsync({ name, slug, description, icon });
        toast({
          title: "Knowledge Base Created",
          description: `"${name}" has been created successfully.`,
        });
      } else {
        await updateKb.mutateAsync({ id, name, slug, description, icon });
        toast({
          title: "Knowledge Base Updated",
          description: `"${name}" has been updated successfully.`,
        });
      }
      setLocation("/admin/knowledge-bases");
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isNew ? "create" : "update"} knowledge base. Please try again.`,
        variant: "destructive",
      });
    }
  };

  if (!isNew && kbLoading) {
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
            <Link href="/admin/knowledge-bases">
              <Button variant="ghost" className="mb-4" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Knowledge Bases
              </Button>
            </Link>
            <h1 className="text-3xl font-bold" data-testid="text-kb-edit-title">
              {isNew ? "Create Knowledge Base" : "Edit Knowledge Base"}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., PICO Documentation"
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
                    placeholder="e.g., pico"
                    required
                    data-testid="input-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /{slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of this knowledge base"
                    rows={3}
                    data-testid="input-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger data-testid="select-icon">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {icons.map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          {iconName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Link href="/admin/knowledge-bases">
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
