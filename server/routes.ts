import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertCollectionSchema, insertCategorySchema, insertPageSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Public API routes

  // Get all collections (public)
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  // Get collection by slug with categories and pages (public)
  app.get("/api/collections/:slug", async (req, res) => {
    try {
      const collection = await storage.getCollectionBySlug(req.params.slug);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Get page by collection slug and page slug (public)
  app.get("/api/pages/:collectionSlug/:pageSlug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.collectionSlug, req.params.pageSlug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  // Search pages (public)
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.json([]);
      }
      const results = await storage.searchPages(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Admin API routes (protected)

  // Collections CRUD
  app.get("/api/admin/collections", isAuthenticated, async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get("/api/admin/collections/:id", isAuthenticated, async (req, res) => {
    try {
      const collection = await storage.getCollectionById(req.params.id);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  app.post("/api/admin/collections", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertCollectionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const collection = await storage.createCollection(parsed.data);
      res.status(201).json(collection);
    } catch (error) {
      console.error("Error creating collection:", error);
      res.status(500).json({ message: "Failed to create collection" });
    }
  });

  app.put("/api/admin/collections/:id", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertCollectionSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const collection = await storage.updateCollection(req.params.id, parsed.data);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error updating collection:", error);
      res.status(500).json({ message: "Failed to update collection" });
    }
  });

  app.delete("/api/admin/collections/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCollection(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting collection:", error);
      res.status(500).json({ message: "Failed to delete collection" });
    }
  });

  // Categories CRUD
  app.get("/api/admin/categories", isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/admin/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const category = await storage.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/admin/categories", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const category = await storage.createCategory(parsed.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertCategorySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const category = await storage.updateCategory(req.params.id, parsed.data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Pages CRUD
  app.get("/api/admin/pages", isAuthenticated, async (req, res) => {
    try {
      const pages = await storage.getPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/admin/pages/:id", isAuthenticated, async (req, res) => {
    try {
      const page = await storage.getPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/admin/pages", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertPageSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const page = await storage.createPage(parsed.data);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put("/api/admin/pages/:id", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertPageSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }
      const page = await storage.updatePage(req.params.id, parsed.data);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/admin/pages/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  return httpServer;
}
