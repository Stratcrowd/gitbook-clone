# Thinking Robot Knowledge Base

A production-ready GitBook-style documentation platform built with React and Supabase.

## Overview

This is a comprehensive knowledge base application for "Thinking Robot" that features:
- Public documentation browsing with hierarchical navigation (Knowledge Bases → Categories → Articles)
- Admin panel for content management with rich text editor
- Full-text search across all articles
- Rich text content with TipTap editor (supports paste from Google Docs/Notion)
- Dark/light theme support
- Supabase authentication for admin access

## Architecture

### Frontend (React + Vite)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query
- **Editor**: TipTap rich text editor with HTML storage
- **Fonts**: Inter (body), JetBrains Mono (code)

### Backend (Supabase)
- **Database**: PostgreSQL (Supabase-hosted)
- **Authentication**: Supabase Auth (email/password)
- **API**: Supabase JavaScript client (direct database access)
- **Row Level Security**: Public read, authenticated write

### Database Schema
- **knowledge_bases**: Top-level documentation groupings
- **categories**: Organizational groupings within knowledge bases
- **articles**: Documentation content with unlimited nesting (via parent_id)

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── admin/                 # Admin panel components
│   │   ├── header.tsx             # Main navigation header
│   │   ├── rich-text-editor.tsx   # TipTap editor component
│   │   ├── table-of-contents.tsx  # Article TOC component
│   │   └── ...
│   ├── pages/
│   │   ├── home.tsx               # Home page with knowledge base cards
│   │   ├── knowledge-base-view.tsx # Knowledge base overview
│   │   ├── article-view.tsx       # Individual article page
│   │   ├── search.tsx             # Search results page
│   │   └── admin/                 # Admin dashboard pages
│   ├── hooks/
│   │   ├── use-supabase-auth.tsx  # Supabase authentication hook
│   │   ├── use-knowledge-base.ts  # Data access hooks
│   │   └── use-toast.ts           # Toast notifications
│   └── lib/
│       ├── supabase.ts            # Supabase client configuration
│       ├── queryClient.ts         # TanStack Query configuration
│       └── utils.ts               # Utility functions

shared/
├── types.ts                       # TypeScript type definitions

supabase-schema.sql                # Database schema (run in Supabase SQL Editor)
```

## Key Features

### Public Features
1. **Home Page**: Display knowledge bases as cards with icons and descriptions
2. **Knowledge Base Page**: Left sidebar with expandable category/article tree
3. **Article View**: Content display with table of contents and breadcrumbs
4. **Search**: Full-text search across article titles and content

### Admin Features
1. **Dashboard**: Overview with statistics and quick actions
2. **Knowledge Bases CRUD**: Create, edit, delete documentation groups
3. **Categories CRUD**: Organize articles into categories
4. **Articles CRUD**: Create and edit documentation with rich text editor
5. **Publish Control**: Toggle article visibility

## Setup Instructions

### 1. Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Create an admin user in Authentication → Users

### 2. Environment Variables
Set these in your Replit secrets:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 3. Run the Application
The app runs via the "Start application" workflow which executes `npm run dev`.

## Deployment

### Recommended Setup
- **Frontend**: Deploy to Vercel (connects to Supabase)
- **Backend**: Supabase (hosted PostgreSQL + Auth)

### Current Setup
The Express server is only used for development. All data operations go directly to Supabase from the frontend.

## User Preferences

- Documentation uses clean, professional styling
- Rich text content supports: headings, lists, code blocks, images, links, blockquotes
- Dark/light theme toggle available in header
- Inter font for body text, JetBrains Mono for code
