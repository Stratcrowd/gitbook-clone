import {
  collections,
  categories,
  pages,
  type Collection,
  type InsertCollection,
  type Category,
  type InsertCategory,
  type Page,
  type InsertPage,
  type CollectionWithContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Collections
  getCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<CollectionWithContent | undefined>;
  getCollectionById(id: string): Promise<Collection | undefined>;
  createCollection(data: InsertCollection): Promise<Collection>;
  updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  getCategoriesByCollectionId(collectionId: string): Promise<Category[]>;
  createCategory(data: InsertCategory): Promise<Category>;
  updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Pages
  getPages(): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  getPageBySlug(collectionSlug: string, pageSlug: string): Promise<Page | undefined>;
  getPagesByCollectionId(collectionId: string): Promise<Page[]>;
  createPage(data: InsertPage): Promise<Page>;
  updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;

  // Search
  searchPages(query: string): Promise<{ page: Page; collection: Collection; snippet: string }[]>;
}

export class DatabaseStorage implements IStorage {
  // Collections
  async getCollections(): Promise<Collection[]> {
    return db.select().from(collections).orderBy(asc(collections.order), asc(collections.title));
  }

  async getCollectionBySlug(slug: string): Promise<CollectionWithContent | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.slug, slug));
    if (!collection) return undefined;

    const collectionCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.collectionId, collection.id))
      .orderBy(asc(categories.order));

    const collectionPages = await db
      .select()
      .from(pages)
      .where(eq(pages.collectionId, collection.id))
      .orderBy(asc(pages.order));

    return {
      ...collection,
      categories: collectionCategories.map((cat) => ({
        ...cat,
        pages: collectionPages.filter((p) => p.categoryId === cat.id),
      })),
      pages: collectionPages,
    };
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async createCollection(data: InsertCollection): Promise<Collection> {
    const [collection] = await db.insert(collections).values(data).returning();
    return collection;
  }

  async updateCollection(id: string, data: Partial<InsertCollection>): Promise<Collection | undefined> {
    const [collection] = await db
      .update(collections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(collections.id, id))
      .returning();
    return collection;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await db.delete(collections).where(eq(collections.id, id));
    return true;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.order), asc(categories.title));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoriesByCollectionId(collectionId: string): Promise<Category[]> {
    return db
      .select()
      .from(categories)
      .where(eq(categories.collectionId, collectionId))
      .orderBy(asc(categories.order));
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async updateCategory(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Pages
  async getPages(): Promise<Page[]> {
    return db.select().from(pages).orderBy(desc(pages.updatedAt));
  }

  async getPageById(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(collectionSlug: string, pageSlug: string): Promise<Page | undefined> {
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.slug, collectionSlug));
    
    if (!collection) return undefined;

    const [page] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.collectionId, collection.id), eq(pages.slug, pageSlug)));
    
    return page;
  }

  async getPagesByCollectionId(collectionId: string): Promise<Page[]> {
    return db
      .select()
      .from(pages)
      .where(eq(pages.collectionId, collectionId))
      .orderBy(asc(pages.order));
  }

  async createPage(data: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values(data).returning();
    return page;
  }

  async updatePage(id: string, data: Partial<InsertPage>): Promise<Page | undefined> {
    const [page] = await db
      .update(pages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return page;
  }

  async deletePage(id: string): Promise<boolean> {
    await db.delete(pages).where(eq(pages.id, id));
    return true;
  }

  // Search
  async searchPages(query: string): Promise<{ page: Page; collection: Collection; snippet: string }[]> {
    const searchTerm = `%${query}%`;
    
    const matchingPages = await db
      .select()
      .from(pages)
      .where(
        and(
          eq(pages.published, true),
          or(
            ilike(pages.title, searchTerm),
            ilike(pages.content, searchTerm)
          )
        )
      )
      .limit(20);

    const results = await Promise.all(
      matchingPages.map(async (page) => {
        const [collection] = await db
          .select()
          .from(collections)
          .where(eq(collections.id, page.collectionId));

        const content = page.content || "";
        const lowerContent = content.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerContent.indexOf(lowerQuery);
        
        let snippet = "";
        if (index >= 0) {
          const start = Math.max(0, index - 50);
          const end = Math.min(content.length, index + query.length + 50);
          snippet = (start > 0 ? "..." : "") + content.slice(start, end) + (end < content.length ? "..." : "");
        } else {
          snippet = content.slice(0, 100) + (content.length > 100 ? "..." : "");
        }

        return { page, collection, snippet };
      })
    );

    return results.filter((r) => r.collection);
  }
}

export const storage = new DatabaseStorage();
