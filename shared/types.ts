import { z } from "zod";

export const knowledgeBaseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  order_index: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const categorySchema = z.object({
  id: z.string().uuid(),
  knowledge_base_id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  order_index: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const articleSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string(),
  published: z.boolean(),
  order_index: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const insertKnowledgeBaseSchema = knowledgeBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertArticleSchema = articleSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type KnowledgeBase = z.infer<typeof knowledgeBaseSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Article = z.infer<typeof articleSchema>;

export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type ArticleWithChildren = Article & {
  children?: ArticleWithChildren[];
};

export type CategoryWithArticles = Category & {
  articles: ArticleWithChildren[];
};

export type KnowledgeBaseWithContent = KnowledgeBase & {
  categories: CategoryWithArticles[];
};
