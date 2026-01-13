import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-supabase-auth";
import { AdminGuard } from "@/components/admin/admin-guard";
import Home from "@/pages/home";
import KnowledgeBaseView from "@/pages/knowledge-base-view";
import ArticleView from "@/pages/article-view";
import Search from "@/pages/search";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import KnowledgeBasesList from "@/pages/admin/knowledge-bases-list";
import KnowledgeBaseEdit from "@/pages/admin/knowledge-base-edit";
import CategoriesList from "@/pages/admin/categories-list";
import CategoryEdit from "@/pages/admin/category-edit";
import ArticlesList from "@/pages/admin/articles-list";
import ArticleEdit from "@/pages/admin/article-edit";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin">
        <AdminGuard>
          <AdminDashboard />
        </AdminGuard>
      </Route>
      <Route path="/admin/knowledge-bases">
        <AdminGuard>
          <KnowledgeBasesList />
        </AdminGuard>
      </Route>
      <Route path="/admin/knowledge-bases/new">
        <AdminGuard>
          <KnowledgeBaseEdit />
        </AdminGuard>
      </Route>
      <Route path="/admin/knowledge-bases/:id">
        <AdminGuard>
          <KnowledgeBaseEdit />
        </AdminGuard>
      </Route>
      <Route path="/admin/categories">
        <AdminGuard>
          <CategoriesList />
        </AdminGuard>
      </Route>
      <Route path="/admin/categories/new">
        <AdminGuard>
          <CategoryEdit />
        </AdminGuard>
      </Route>
      <Route path="/admin/categories/:id">
        <AdminGuard>
          <CategoryEdit />
        </AdminGuard>
      </Route>
      <Route path="/admin/articles">
        <AdminGuard>
          <ArticlesList />
        </AdminGuard>
      </Route>
      <Route path="/admin/articles/new">
        <AdminGuard>
          <ArticleEdit />
        </AdminGuard>
      </Route>
      <Route path="/admin/articles/:id">
        <AdminGuard>
          <ArticleEdit />
        </AdminGuard>
      </Route>

      <Route path="/:kbSlug/:articleSlug" component={ArticleView} />
      <Route path="/:kbSlug" component={KnowledgeBaseView} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="thinking-robot-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
