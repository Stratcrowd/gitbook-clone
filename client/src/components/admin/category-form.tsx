import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Category, Collection } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  collectionId: z.string().min(1, "Collection is required"),
  order: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: Category;
  collections: Collection[];
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export function CategoryForm({ category, collections, onSubmit, isLoading }: CategoryFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: category?.title || "",
      slug: category?.slug || "",
      collectionId: category?.collectionId || "",
      order: category?.order || 0,
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
          name="collectionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-category-collection">
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.title}
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Getting Started"
                  onChange={(e) => {
                    field.onChange(e);
                    if (!category) {
                      form.setValue("slug", generateSlug(e.target.value));
                    }
                  }}
                  data-testid="input-category-title"
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
                  placeholder="e.g., getting-started"
                  data-testid="input-category-slug"
                />
              </FormControl>
              <FormDescription>
                Used for organizing pages
              </FormDescription>
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
                  data-testid="input-category-order"
                />
              </FormControl>
              <FormDescription>
                Lower numbers appear first
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} data-testid="button-submit-category">
          {isLoading ? "Saving..." : category ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Form>
  );
}
