import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { KnowledgeBase, Category, Article, ArticleWithChildren, CategoryWithArticles, KnowledgeBaseWithContent } from "@shared/types";

export function useKnowledgeBases() {
  return useQuery({
    queryKey: ["knowledge_bases"],
    queryFn: async (): Promise<KnowledgeBase[]> => {
      const { data, error } = await supabase
        .from("knowledge_bases")
        .select("*")
        .order("order_index");
      
      if (error) throw error;
      return data || [];
    },
  });
}

export function useKnowledgeBase(slug: string) {
  return useQuery({
    queryKey: ["knowledge_bases", slug],
    queryFn: async (): Promise<KnowledgeBaseWithContent | null> => {
      const { data: kb, error: kbError } = await supabase
        .from("knowledge_bases")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (kbError) throw kbError;
      if (!kb) return null;

      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("knowledge_base_id", kb.id)
        .order("order_index");
      
      if (catError) throw catError;

      const categoryIds = categories?.map((c) => c.id) || [];
      
      const { data: articles, error: artError } = await supabase
        .from("articles")
        .select("*")
        .in("category_id", categoryIds.length ? categoryIds : ["__none__"])
        .order("order_index");
      
      if (artError) throw artError;

      const buildArticleTree = (articles: Article[], parentId: string | null = null): ArticleWithChildren[] => {
        return articles
          .filter((a) => a.parent_id === parentId)
          .map((article) => ({
            ...article,
            children: buildArticleTree(articles, article.id),
          }));
      };

      const categoriesWithArticles: CategoryWithArticles[] = (categories || []).map((cat) => ({
        ...cat,
        articles: buildArticleTree(articles?.filter((a) => a.category_id === cat.id) || []),
      }));

      return {
        ...kb,
        categories: categoriesWithArticles,
      };
    },
    enabled: !!slug,
  });
}

export function useArticle(kbSlug: string, articleSlug: string) {
  return useQuery({
    queryKey: ["articles", kbSlug, articleSlug],
    queryFn: async (): Promise<Article | null> => {
      const { data: kb } = await supabase
        .from("knowledge_bases")
        .select("id")
        .eq("slug", kbSlug)
        .single();
      
      if (!kb) return null;

      const { data: categories } = await supabase
        .from("categories")
        .select("id")
        .eq("knowledge_base_id", kb.id);

      const categoryIds = categories?.map((c) => c.id) || [];

      const { data: article, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", articleSlug)
        .in("category_id", categoryIds.length ? categoryIds : ["__none__"])
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return article || null;
    },
    enabled: !!kbSlug && !!articleSlug,
  });
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async (): Promise<Article[]> => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: query.length > 2,
  });
}

export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string; icon?: string }) => {
      const { data: kb, error } = await supabase
        .from("knowledge_bases")
        .insert({ ...data, order_index: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return kb;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });
}

export function useUpdateKnowledgeBase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; slug?: string; description?: string; icon?: string }) => {
      const { data: kb, error } = await supabase
        .from("knowledge_bases")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return kb;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("knowledge_bases")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { knowledge_base_id: string; name: string; slug: string; description?: string }) => {
      const { data: cat, error } = await supabase
        .from("categories")
        .insert({ ...data, order_index: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return cat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; slug?: string; description?: string }) => {
      const { data: cat, error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return cat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      category_id: string; 
      title: string; 
      slug: string; 
      content: string; 
      published?: boolean;
      parent_id?: string;
    }) => {
      const { data: article, error } = await supabase
        .from("articles")
        .insert({ ...data, order_index: 0 })
        .select()
        .single();
      
      if (error) throw error;
      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: { 
      id: string; 
      title?: string; 
      slug?: string; 
      content?: string; 
      published?: boolean;
      parent_id?: string | null;
    }) => {
      const { data: article, error } = await supabase
        .from("articles")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge_bases"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
