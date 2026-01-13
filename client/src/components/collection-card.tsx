import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Cpu, 
  CircuitBoard, 
  Lightbulb, 
  Wrench, 
  BookOpen, 
  Code, 
  Cog,
  Rocket,
  Zap,
  type LucideIcon
} from "lucide-react";
import type { Collection } from "@shared/schema";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Cpu,
  CircuitBoard,
  Lightbulb,
  Wrench,
  BookOpen,
  Code,
  Cog,
  Rocket,
  Zap,
};

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const Icon = iconMap[collection.icon || "FileText"] || FileText;

  return (
    <Link href={`/${collection.slug}`}>
      <Card 
        className="h-full hover-elevate cursor-pointer transition-all duration-200 group"
        data-testid={`card-collection-${collection.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">{collection.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm leading-relaxed">
            {collection.description || "Explore this collection of documentation and guides."}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
