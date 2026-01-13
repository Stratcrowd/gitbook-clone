import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import type { Collection, Category } from "@shared/schema";

interface ImportMarkdownDialogProps {
  collections: Collection[];
  categories: Category[];
  onImport: (data: {
    title: string;
    content: string;
    collectionId: string;
    categoryId?: string;
  }) => void;
  isLoading?: boolean;
}

export function ImportMarkdownDialog({
  collections,
  categories,
  onImport,
  isLoading,
}: ImportMarkdownDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filteredCategories = categories.filter(c => c.collectionId === collectionId);

  const handleSubmit = () => {
    if (!title || !content || !collectionId) return;
    
    onImport({
      title,
      content,
      collectionId,
      categoryId: categoryId || undefined,
    });
    
    setOpen(false);
    setTitle("");
    setContent("");
    setCollectionId("");
    setCategoryId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-import-markdown">
          <Upload className="mr-2 h-4 w-4" />
          Import Markdown
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Markdown</DialogTitle>
          <DialogDescription>
            Paste your Markdown content to create a new page.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="import-title">Page Title</Label>
            <Input
              id="import-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title"
              data-testid="input-import-title"
            />
          </div>

          <div className="grid gap-2">
            <Label>Collection</Label>
            <Select value={collectionId} onValueChange={(value) => {
              setCollectionId(value);
              setCategoryId("");
            }}>
              <SelectTrigger data-testid="select-import-collection">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredCategories.length > 0 && (
            <div className="grid gap-2">
              <Label>Category (Optional)</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger data-testid="select-import-category">
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="import-content">Markdown Content</Label>
            <Textarea
              id="import-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your Markdown here..."
              className="min-h-[200px] font-mono text-sm"
              data-testid="textarea-import-content"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title || !content || !collectionId || isLoading}
            data-testid="button-confirm-import"
          >
            {isLoading ? "Importing..." : "Import Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
