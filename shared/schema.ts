import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Collections - top-level groupings like "Projects", "PICO BOT", etc.
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon").default("FileText"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
  categories: many(categories),
  pages: many(pages),
}));

// Categories - groupings within collections
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("categories_collection_idx").on(table.collectionId),
]);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  collection: one(collections, {
    fields: [categories.collectionId],
    references: [collections.id],
  }),
  pages: many(pages),
}));

// Pages - actual documentation pages with optional nesting
export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: "set null" }),
  parentId: varchar("parent_id"),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  content: text("content").default(""),
  contentType: text("content_type").default("markdown"),
  order: integer("order").default(0),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("pages_collection_idx").on(table.collectionId),
  index("pages_category_idx").on(table.categoryId),
  index("pages_parent_idx").on(table.parentId),
  index("pages_slug_idx").on(table.slug),
]);

export const pagesRelations = relations(pages, ({ one, many }) => ({
  collection: one(collections, {
    fields: [pages.collectionId],
    references: [collections.id],
  }),
  category: one(categories, {
    fields: [pages.categoryId],
    references: [categories.id],
  }),
  parent: one(pages, {
    fields: [pages.parentId],
    references: [pages.id],
    relationName: "pageHierarchy",
  }),
  children: many(pages, {
    relationName: "pageHierarchy",
  }),
}));

// Insert schemas
export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

// Extended types for frontend use
export type PageWithChildren = Page & {
  children?: PageWithChildren[];
};

export type CategoryWithPages = Category & {
  pages: PageWithChildren[];
};

export type CollectionWithContent = Collection & {
  categories: CategoryWithPages[];
  pages: PageWithChildren[];
};
