import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnowledgeBases } from "@/hooks/use-knowledge-base";
import { Link } from "wouter";
import { Book, Cpu, Bot, Wifi, FileText, Folder } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Book,
  Cpu,
  Bot,
  Wifi,
  FileText,
  Folder,
};

export default function Home() {
  const { data: knowledgeBases, isLoading } = useKnowledgeBases();

  const getIcon = (iconName: string | null) => {
    const Icon = iconMap[iconName || "Book"] || Book;
    return <Icon className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4" data-testid="text-home-title">
              Thinking Robot Knowledge Base
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Documentation, guides, and tutorials for robotics, IoT projects, and PCB manufacturing.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="collections-loading">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-8 w-8 rounded mb-2" />
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : knowledgeBases && knowledgeBases.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="collections-grid">
              {knowledgeBases.map((kb) => (
                <Link key={kb.id} href={`/${kb.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-kb-${kb.slug}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {getIcon(kb.icon)}
                        </div>
                        <CardTitle className="text-xl">{kb.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {kb.description || "Explore documentation and guides"}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16" data-testid="collections-empty">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Book className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                No documentation collections yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Sign in as admin to create your first collection.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-6 mt-auto">
        <div className="container max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Thinking Robot Knowledge Base
          </p>
        </div>
      </footer>
    </div>
  );
}
