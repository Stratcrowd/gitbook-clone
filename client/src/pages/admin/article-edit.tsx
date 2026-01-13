import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isNew = !id || id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  const { data: article, isLoading: articleLoading } = useQuery({
    queryKey: ["admin_article", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin_categories_with_kb"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*, knowledge_bases!inner(name)")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: articles } = useQuery({
    queryKey: ["admin_all_articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, category_id")
        .order("title");
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (article) {
      setTitle(article.title || "");
      setSlug(article.slug || "");
      setContent(article.content || "");
      setCategoryId(article.category_id || "");
      setParentId(article.parent_id);
      setPublished(article.published || false);
    }
  }, [article]);

  const createArticle = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("articles")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_articles"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });

  const updateArticle = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("articles")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_articles"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });

  const isSaving = createArticle.isPending || updateArticle.isPending;

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNew) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      toast({
        title: "Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        title,
        slug,
        content,
        category_id: categoryId,
        parent_id: parentId || null,
        published,
        order_index: 0,
      };

      if (isNew) {
        await createArticle.mutateAsync(data);
        toast({
          title: "Article Created",
          description: `"${title}" has been created successfully.`,
        });
      } else {
        await updateArticle.mutateAsync({ id, ...data });
        toast({
          title: "Article Updated",
          description: `"${title}" has been updated successfully.`,
        });
      }
      setLocation("/admin/articles");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isNew ? "create" : "update"} article.`,
        variant: "destructive",
      });
    }
  };

  const parentArticles = articles?.filter(
    (a: any) => a.category_id === categoryId && a.id !== id
  );

  if (!isNew && articleLoading) {
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
        <div className="p-8">
          <div className="mb-8">
            <Link href="/admin/articles">
              <Button variant="ghost" className="mb-4" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Articles
              </Button>
            </Link>
            <h1 className="text-3xl font-bold" data-testid="text-article-edit-title">
              {isNew ? "Create Article" : "Edit Article"}
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Article Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Article title"
                        required
                        data-testid="input-title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="article-slug"
                        required
                        data-testid="input-slug"
                      />
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList>
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="preview">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="editor" className="mt-4">
                        <RichTextEditor
                          content={content}
                          onChange={setContent}
                          placeholder="Start writing your article content..."
                        />
                      </TabsContent>
                      <TabsContent value="preview" className="mt-4">
                        <div 
                          className="prose prose-neutral dark:prose-invert max-w-none min-h-[400px] p-4 border rounded-lg"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.knowledge_bases?.name} / {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {parentArticles && parentArticles.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="parent">Parent Article (optional)</Label>
                        <Select 
                          value={parentId || ""} 
                          onValueChange={(v) => setParentId(v || null)}
                        >
                          <SelectTrigger data-testid="select-parent">
                            <SelectValue placeholder="No parent (top-level)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No parent (top-level)</SelectItem>
                            {parentArticles.map((art: any) => (
                              <SelectItem key={art.id} value={art.id}>
                                {art.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label htmlFor="published">Published</Label>
                      <Switch
                        id="published"
                        checked={published}
                        onCheckedChange={setPublished}
                        data-testid="switch-published"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isSaving} className="flex-1" data-testid="button-save">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isNew ? "Create" : "Save"}
                      </>
                    )}
                  </Button>
                  <Link href="/admin/articles">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
