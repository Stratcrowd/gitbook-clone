# Thinking Robot Knowledge Base - Design Guidelines

## Design Approach: Documentation System Pattern
**Reference Inspiration:** GitBook, ReadMe, Mintlify, Stripe Docs
**Rationale:** This is a utility-focused, information-dense application where readability, navigation efficiency, and content hierarchy are paramount. Using proven documentation patterns ensures optimal user experience.

---

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - body text, navigation, UI elements
- Code: JetBrains Mono - code blocks, inline code

**Hierarchy:**
- Page Titles (H1): text-4xl font-bold
- Section Headers (H2): text-2xl font-semibold, border-b with subtle line
- Subsections (H3): text-xl font-semibold
- Body Text: text-base leading-relaxed (line-height: 1.75)
- Navigation Items: text-sm font-medium
- Breadcrumbs: text-sm
- Code Inline: text-sm font-mono with subtle background
- Code Blocks: text-sm font-mono with line numbers

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Consistent vertical rhythm: space-y-4 for body content, space-y-8 for major sections
- Component padding: p-4 for cards, p-6 for larger containers
- Section gaps: gap-6 for grids, gap-8 for major layout divisions

**Grid Structure:**

**Public Documentation Pages:**
- Three-column layout on desktop (lg:)
  - Left Sidebar: Fixed width 280px, sticky positioning
  - Main Content: Flexible, max-w-3xl for optimal reading line length
  - Right TOC: Fixed width 240px, sticky positioning
- Collapse to single column on mobile with hamburger menu

**Admin Dashboard:**
- Two-column layout
  - Left Sidebar: Fixed 256px navigation
  - Main Content Area: Flexible with max-w-6xl container

**Collection Home Page:**
- Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Card-based layout with hover elevation

---

## Component Library

### Navigation Components

**Left Sidebar (Public Docs):**
- Hierarchical tree structure with indentation (pl-4 per level)
- Expandable/collapsible categories with chevron icons (Heroicons)
- Active page highlighted with subtle background and border-l-4 accent
- Nested pages indented progressively
- Search box at top of sidebar (sticky)

**Breadcrumbs:**
- Horizontal navigation trail below header
- Chevron separators between items
- Last item non-clickable, visually distinct
- Truncate middle items on mobile if needed

**Table of Contents (Right Sidebar):**
- Auto-generated from H2/H3 headings
- Sticky positioning with scroll-spy highlighting active section
- Indented structure (pl-2 for H3 under H2)
- Smooth scroll on click

### Content Components

**Collection Cards (Home Page):**
- Rectangular cards with aspect ratio preservation
- Icon at top (use Heroicons - DocumentText, Code, Cog6Tooth, etc.)
- Title (text-xl font-semibold)
- Short description (text-sm)
- Subtle hover state with elevation (shadow-lg)
- Minimum 3 cards per row on desktop

**Page Content Container:**
- Centered with max-w-3xl for readability
- Generous line spacing (leading-relaxed)
- Clear visual separation between sections

**Code Blocks:**
- Dark theme with syntax highlighting (use Shiki or Prism)
- Language tag in top-right corner
- Copy button in top-right
- Line numbers on left
- Horizontal scroll for overflow
- Rounded corners (rounded-lg)

**Callout Boxes:**
- Four types: Info, Warning, Success, Error
- Left border accent (border-l-4)
- Icon aligned to title (Heroicons: InformationCircle, ExclamationTriangle, CheckCircle, XCircle)
- Subtle background differentiation
- Padding: p-4

**Tables:**
- Full-width with responsive horizontal scroll wrapper
- Header row with bottom border
- Striped rows for readability
- Cell padding: px-4 py-2

**Images in Content:**
- Centered with shadow-md
- Rounded corners (rounded-lg)
- Click to enlarge modal (optional zoom)
- Caption support below image (text-sm italic)

### Admin Components

**Admin Sidebar:**
- Dashboard, Collections, Categories, Pages sections
- Create buttons prominently placed
- Icons for each section (Heroicons)
- Active state highlighting

**Editor Interface:**
- Split view option: Markdown source | Preview
- Toolbar with formatting buttons (bold, italic, headings, code, link, image)
- Full-height editor with minimal chrome
- Auto-save indicator
- Publish/Draft toggle prominently displayed

**Hierarchy Builder:**
- Drag handles for reordering (using grip-vertical icon)
- Indented tree view matching public sidebar
- Edit/Delete actions on hover
- Add nested page button per item

**Search Results:**
- List view with title, snippet, breadcrumb path
- Highlighted search terms in snippets
- Relevance sorting
- "No results" state with helpful suggestions

### Navigation & Actions

**Header (Public):**
- Logo/site title on left
- Search bar centered or right-aligned
- Sign in button (admin access) on far right
- Sticky positioning with subtle shadow on scroll

**Previous/Next Navigation:**
- Bottom of content area
- Two-column layout: Previous (left), Next (right)
- Include page titles with directional arrows
- Full-width on mobile, stacked

**Admin Action Buttons:**
- Primary actions: solid background (e.g., "Save", "Publish")
- Secondary actions: outline style (e.g., "Cancel", "Preview")
- Destructive actions: distinct treatment (e.g., "Delete")

---

## Images

**Collection Cards:** Each card includes a relevant icon from Heroicons (64px size) - do not use actual images for collection cards, use scalable vector icons

**Content Images:** Docs pages may include technical diagrams, screenshots, or instructional images - these should be centered, have subtle shadows, and support zoom on click

**No Hero Image:** This is a documentation site, not a marketing page - start directly with useful content (search + navigation or collection cards)

---

## Animations

**Minimal Motion:**
- Sidebar expand/collapse: smooth 200ms transition
- Dropdown menus: 150ms fade-in
- Hover states: 100ms transition on shadows/backgrounds
- Scroll-spy TOC highlighting: instant feedback, no animation
- No parallax, no heavy scroll animations - focus on content readability