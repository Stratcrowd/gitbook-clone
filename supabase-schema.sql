-- Supabase SQL Schema for Thinking Robot Knowledge Base
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Knowledge Bases table (top-level grouping)
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table (within a knowledge base)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_base_id UUID NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(knowledge_base_id, slug)
);

-- Articles table (within a category, supports unlimited nesting via parent_id)
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, parent_id, slug)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_knowledge_base_id ON categories(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_parent_id ON articles(parent_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_slug ON knowledge_bases(slug);

-- Full-text search index on articles
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN(to_tsvector('english', title || ' ' || content));

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access for knowledge_bases" ON knowledge_bases
  FOR SELECT USING (true);

CREATE POLICY "Public read access for categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access for published articles" ON articles
  FOR SELECT USING (published = true);

-- Admin write access (authenticated users can write)
CREATE POLICY "Admin write access for knowledge_bases" ON knowledge_bases
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write access for categories" ON categories
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin write access for articles" ON articles
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_knowledge_bases_updated_at
  BEFORE UPDATE ON knowledge_bases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO knowledge_bases (name, slug, description, icon, order_index) VALUES
  ('PICO', 'pico', 'PICO microcontroller documentation and tutorials', 'Cpu', 0),
  ('Robotics', 'robotics', 'Robotics projects and guides', 'Bot', 1),
  ('IoT', 'iot', 'Internet of Things documentation', 'Wifi', 2),
  ('Internal Docs', 'internal-docs', 'Internal team documentation', 'FileText', 3)
ON CONFLICT (slug) DO NOTHING;
