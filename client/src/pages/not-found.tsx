import { Link } from "wouter";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3" data-testid="text-404-title">
            Page Not Found
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button data-testid="button-go-home">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
