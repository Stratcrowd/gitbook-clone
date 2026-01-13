import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Layers, 
  FileText, 
  ChevronLeft,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/knowledge-bases", icon: FolderOpen, label: "Knowledge Bases" },
  { href: "/admin/categories", icon: Layers, label: "Categories" },
  { href: "/admin/articles", icon: FileText, label: "Articles" },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { signOut, user } = useSupabaseAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-back-to-docs">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="font-semibold">Admin Panel</span>
      </div>
      
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1" data-testid="admin-nav">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href !== "/admin" && location.startsWith(item.href));
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  data-testid={`link-admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground mb-2 truncate">
          {user?.email}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={signOut}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
