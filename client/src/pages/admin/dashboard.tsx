import { Link } from "wouter";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderOpen, Layers, FileText, Plus, TrendingUp } from "lucide-react";
import { useKnowledgeBases } from "@/hooks/use-knowledge-base";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard() {
  const { data: knowledgeBases, isLoading: kbLoading } = useKnowledgeBases();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ["admin_articles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = kbLoading || categoriesLoading || articlesLoading;

  const stats = [
    {
      title: "Knowledge Bases",
      value: knowledgeBases?.length || 0,
      icon: FolderOpen,
      href: "/admin/knowledge-bases",
      color: "text-blue-500",
    },
    {
      title: "Categories",
      value: categories?.length || 0,
      icon: Layers,
      href: "/admin/categories",
      color: "text-green-500",
    },
    {
      title: "Articles",
      value: articles?.length || 0,
      icon: FileText,
      href: "/admin/articles",
      color: "text-purple-500",
    },
    {
      title: "Published",
      value: articles?.filter((a: any) => a.published).length || 0,
      icon: TrendingUp,
      href: "/admin/articles",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold" data-testid="text-admin-title">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your knowledge base content
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover-elevate cursor-pointer" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="text-2xl font-bold">{stat.value}</div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/knowledge-bases/new">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-new-kb">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Knowledge Base
                  </Button>
                </Link>
                <Link href="/admin/categories/new">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-new-category">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Category
                  </Button>
                </Link>
                <Link href="/admin/articles/new">
                  <Button className="w-full justify-start" variant="outline" data-testid="button-new-article">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Article
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : articles && articles.length > 0 ? (
                  <div className="space-y-2">
                    {articles.slice(0, 5).map((article: any) => (
                      <Link key={article.id} href={`/admin/articles/${article.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`link-recent-article-${article.id}`}>
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{article.title}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${article.published ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                            {article.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No articles yet. Create your first article to get started.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
