import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Collection } from "@shared/schema";

const iconOptions = [
  { value: "FileText", label: "Document" },
  { value: "Cpu", label: "CPU/Processor" },
  { value: "CircuitBoard", label: "Circuit Board" },
  { value: "Lightbulb", label: "Lightbulb" },
  { value: "Wrench", label: "Wrench/Tools" },
  { value: "BookOpen", label: "Book" },
  { value: "Code", label: "Code" },
  { value: "Cog", label: "Settings/Cog" },
  { value: "Rocket", label: "Rocket" },
  { value: "Zap", label: "Lightning" },
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
  icon: z.string().default("FileText"),
  order: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CollectionFormProps {
  collection?: Collection;
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export function CollectionForm({ collection, onSubmit, isLoading }: CollectionFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: collection?.title || "",
      slug: collection?.slug || "",
      description: collection?.description || "",
      icon: collection?.icon || "FileText",
      order: collection?.order || 0,
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., PICO BOT"
                  onChange={(e) => {
                    field.onChange(e);
                    if (!collection) {
                      form.setValue("slug", generateSlug(e.target.value));
                    }
                  }}
                  data-testid="input-collection-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., pico-bot"
                  data-testid="input-collection-slug"
                />
              </FormControl>
              <FormDescription>
                Used in the URL: /your-slug
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Brief description of this collection..."
                  rows={3}
                  data-testid="input-collection-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-collection-icon">
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={0}
                  data-testid="input-collection-order"
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} data-testid="button-submit-collection">
          {isLoading ? "Saving..." : collection ? "Update Collection" : "Create Collection"}
        </Button>
      </form>
    </Form>
  );
}
