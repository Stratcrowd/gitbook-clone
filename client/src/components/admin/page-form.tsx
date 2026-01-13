import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { MarkdownEditor } from "./markdown-editor";
import type { Page, Collection, Category } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  collectionId: z.string().min(1, "Collection is required"),
  categoryId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  content: z.string().default(""),
  published: z.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface PageFormProps {
  page?: Page;
  collections: Collection[];
  categories: Category[];
  pages: Page[];
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
}

export function PageForm({ page, collections, categories, pages, onSubmit, isLoading }: PageFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page?.title || "",
      slug: page?.slug || "",
      collectionId: page?.collectionId || "",
      categoryId: page?.categoryId || null,
      parentId: page?.parentId || null,
      content: page?.content || "",
      published: page?.published || false,
      order: page?.order || 0,
    },
  });

  const selectedCollectionId = form.watch("collectionId");
  const filteredCategories = categories.filter(c => c.collectionId === selectedCollectionId);
  const filteredPages = pages.filter(p => p.collectionId === selectedCollectionId && p.id !== page?.id);

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
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., Getting Started Guide"
                    onChange={(e) => {
                      field.onChange(e);
                      if (!page) {
                        form.setValue("slug", generateSlug(e.target.value));
                      }
                    }}
                    data-testid="input-page-title"
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
                    placeholder="e.g., getting-started-guide"
                    data-testid="input-page-slug"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="collectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("categoryId", null);
                    form.setValue("parentId", null);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-page-collection">
                      <SelectValue placeholder="Select collection" />
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
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                  defaultValue={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-page-category">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
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
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Page (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)} 
                  defaultValue={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-page-parent">
                      <SelectValue placeholder="No parent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No parent (top level)</SelectItem>
                    {filteredPages.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Create nested pages
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
                    data-testid="input-page-order"
                  />
                </FormControl>
                <FormDescription>
                  Lower numbers appear first
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Published</FormLabel>
                  <FormDescription>
                    Make this page visible to the public
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="switch-page-published"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading} data-testid="button-submit-page">
            {isLoading ? "Saving..." : page ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
