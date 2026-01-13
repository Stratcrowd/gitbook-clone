import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  LinkIcon,
  Undo,
  Redo,
} from "lucide-react";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Start writing your content...",
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none min-h-[400px] focus:outline-none p-4",
      },
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData("text/html");
        if (html) {
          return false;
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8", editor.isActive("bold") && "bg-muted")}
          data-testid="button-bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8", editor.isActive("italic") && "bg-muted")}
          data-testid="button-italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("h-8 w-8", editor.isActive("strike") && "bg-muted")}
          data-testid="button-strike"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn("h-8 w-8", editor.isActive("code") && "bg-muted")}
          data-testid="button-code"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border self-center mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-muted")}
          data-testid="button-h1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-muted")}
          data-testid="button-h2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("h-8 w-8", editor.isActive("heading", { level: 3 }) && "bg-muted")}
          data-testid="button-h3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={cn("h-8 w-8", editor.isActive("heading", { level: 4 }) && "bg-muted")}
          data-testid="button-h4"
        >
          <Heading4 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={cn("h-8 w-8", editor.isActive("heading", { level: 5 }) && "bg-muted")}
          data-testid="button-h5"
        >
          <Heading5 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={cn("h-8 w-8", editor.isActive("heading", { level: 6 }) && "bg-muted")}
          data-testid="button-h6"
        >
          <Heading6 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border self-center mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-muted")}
          data-testid="button-bullet-list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-muted")}
          data-testid="button-ordered-list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("h-8 w-8", editor.isActive("blockquote") && "bg-muted")}
          data-testid="button-blockquote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn("h-8 w-8", editor.isActive("codeBlock") && "bg-muted")}
          data-testid="button-code-block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          data-testid="button-hr"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border self-center mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={addImage}
          data-testid="button-image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={setLink}
          className={cn("h-8 w-8", editor.isActive("link") && "bg-muted")}
          data-testid="button-link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border self-center mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          data-testid="button-undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          data-testid="button-redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      <EditorContent editor={editor} />
    </div>
  );
}
