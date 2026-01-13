import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Code, 
  Link as LinkIcon, 
  Image, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<string>("write");

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.querySelector<HTMLTextAreaElement>('[data-testid="textarea-editor"]');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newValue);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarActions = [
    { icon: Heading1, action: () => insertText("\n# ", "", "Heading 1"), label: "H1" },
    { icon: Heading2, action: () => insertText("\n## ", "", "Heading 2"), label: "H2" },
    { icon: Heading3, action: () => insertText("\n### ", "", "Heading 3"), label: "H3" },
    { type: "separator" },
    { icon: Bold, action: () => insertText("**", "**", "bold text"), label: "Bold" },
    { icon: Italic, action: () => insertText("*", "*", "italic text"), label: "Italic" },
    { icon: Code, action: () => insertText("`", "`", "code"), label: "Code" },
    { type: "separator" },
    { icon: LinkIcon, action: () => insertText("[", "](url)", "link text"), label: "Link" },
    { icon: Image, action: () => insertText("![", "](url)", "alt text"), label: "Image" },
    { type: "separator" },
    { icon: List, action: () => insertText("\n- ", "", "list item"), label: "Bullet List" },
    { icon: ListOrdered, action: () => insertText("\n1. ", "", "list item"), label: "Numbered List" },
    { icon: Quote, action: () => insertText("\n> ", "", "quote"), label: "Quote" },
    { icon: Table, action: () => insertText("\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n", ""), label: "Table" },
  ];

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b bg-muted/30 px-2">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            {toolbarActions.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <div key={index} className="w-px h-6 bg-border mx-1" />
                );
              }
              const Icon = item.icon!;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={item.action}
                  title={item.label}
                  data-testid={`button-editor-${item.label?.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
          
          <TabsList className="h-9 bg-transparent">
            <TabsTrigger value="write" className="text-xs" data-testid="tab-write">
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs" data-testid="tab-preview">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your content in Markdown..."
            className="min-h-[400px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm"
            data-testid="textarea-editor"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div className="min-h-[400px] p-4 overflow-auto" data-testid="editor-preview">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-muted-foreground italic">Nothing to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
