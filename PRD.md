# Recipe App - Product Requirements Document

## Overview

Build the best recipe app in the world - a full-featured, local-first recipe management application with meal planning, shopping lists, cooking mode, and recipe import capabilities.

**Target**: Single-user local application (no deployment, no auth)
**Inspiration**: Mealie, Tandoor, Paprika, Samsung Food, Ollie

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React | 19.2.x |
| Language | TypeScript | 5.9.x |
| Framework | Next.js (App Router, Server Components, Server Actions) | 16.1.x |
| Styling | Tailwind CSS (CSS-first config) | 4.1.x |
| UI Components | shadcn/ui (New York style, unified radix-ui package) | latest (CLI 3.0+) |
| Database | SQLite (local file) | 3.51.x |
| ORM | Prisma (ESM-only, prisma.config.ts) | 7.2.x |
| Validation | Zod + react-hook-form | 4.3.x + 7.71.x |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable | 6.3.x + 10.0.x |
| Date Utilities | date-fns | 4.1.x |
| Recipe Import | cheerio (HTML/JSON-LD parsing) | 1.2.x |
| Slug Generation | slugify | 1.6.x |
| Dark Mode | next-themes | 0.4.x |
| Icons | lucide-react (bundled with shadcn) | 0.563.x |

---

## Design System & Visual Direction

> **Reference**: Flavoriz-inspired warm, modern food-focused aesthetic. See `/screenshots/` for visual reference.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#F5A623` | Amber/orange accent — buttons, active nav, highlighted words in headings, step numbers, tag labels, stat numbers |
| `--color-primary-hover` | `#E0911A` | Button hover, interactive accent hover |
| `--color-primary-light` | `#FEF3D9` | Light amber tint for active filter pills, subtle badge backgrounds |
| `--color-background` | `#FEF7EC` | Warm cream page background (light mode) |
| `--color-surface` | `#FFFFFF` | Card backgrounds, content panels, nav bar |
| `--color-surface-warm` | `#FDF0DC` | Secondary surface — ingredient/nutrition cards, testimonial backgrounds |
| `--color-text-primary` | `#1A1A1A` | Headings, body text |
| `--color-text-secondary` | `#6B7280` | Descriptions, metadata, timestamps |
| `--color-text-accent` | `#F5A623` | Highlighted words within headings (e.g., "Ground **Beef** Mexican Tacos") |
| `--color-footer-bg` | `#1A1A2E` | Dark charcoal footer background |
| `--color-footer-text` | `#FFFFFF` | Footer text and logo |
| `--color-border` | `#E5E7EB` | Subtle card borders, dividers |

**Dark mode**: Invert backgrounds to dark charcoal (`#111827` body, `#1F2937` cards), keep amber accent unchanged, lighten text to white/gray.

### Typography

| Element | Style |
|---------|-------|
| Logo | Bold sans-serif — first half black, second half amber (e.g., "FLA" black + "VORIZ" orange) |
| Page headings (h1) | 36-48px, bold, sans-serif. Key word highlighted in amber (e.g., "Adventure of **Delicacies**", "Explore **Culinary** Insights") |
| Section headings (h2) | 28-32px, bold. Key word in amber (e.g., "Cooking **Instructions**", "Related **Recipes**") |
| Body text | 16px, regular, `--color-text-primary` |
| Metadata/captions | 14px, `--color-text-secondary` |
| Step numbers | 32-40px, bold, amber — large circled or standalone numbers (01, 02, 03...) |

### Layout

| Pattern | Description |
|---------|-------------|
| Navigation | **Horizontal top navbar** (not sidebar) — logo left, nav links center (Home, Recipes, Meal Plan, Shopping Lists, Categories), search input + user avatar right. Sticky on scroll. White background with subtle bottom border. |
| Page background | Warm cream (`--color-background`), full-width |
| Content width | Max-width 1280px, centered with auto margins |
| Cards | White background, rounded corners (12-16px `border-radius`), subtle drop shadow (`shadow-sm` or `shadow-md`), generous internal padding (20-24px) |
| Hero banners | Full content-width, rounded corners, large food photography with overlaid text (white or dark) and gradient overlay for legibility |
| Grid | Recipe cards in responsive grid: 1 col mobile, 2 col tablet, 3-4 col desktop |
| Spacing | Generous whitespace — 32-48px between sections, 16-24px between cards |
| Mobile nav | Hamburger menu triggering a Sheet/drawer overlay |

### Component Styles

| Component | Design |
|-----------|--------|
| **Primary button** | Amber fill (`--color-primary`), white text, pill-shaped (full rounded), icon on right side. Hover: `--color-primary-hover` |
| **Secondary button** | White/transparent fill, dark border, dark text, pill-shaped. Hover: light amber tint |
| **Recipe card** | Vertical layout — title on top in bold, recipe image below (rounded, 3:2 ratio), "See Complete Recipe" footer bar with amber accent icon. Heart/favorite icon overlay on image. View count badge (e.g., "250+") overlaid on image corner |
| **Category filter pills** | Horizontal scrollable row of pill-shaped buttons with emoji icons. Active state: amber fill + white text. Inactive: white fill + dark text + border |
| **Tags** | Amber text on transparent background, comma-separated or pill-shaped. Clickable |
| **Metadata row** | Icon + label pairs in a horizontal row (Cuisine, Servings, Prep Time, Cook Time, Difficulty) with subtle dividers |
| **Instruction steps** | Large amber step number (01, 02...) on the left, instruction text on the right. Each step in its own card/row with subtle background |
| **Ingredients list** | Clean two-column list inside a warm cream card (`--color-surface-warm`). Quantity + unit + ingredient name per row |
| **Nutritional info** | Compact list inside a warm cream card alongside ingredients. Label + value per row (Calories 320, Protein 25g, etc.) |
| **Footer** | Dark charcoal background, full-width. Logo (amber accent), tagline, multi-column links (Company, Support, Contact), newsletter email input with amber submit button, copyright |
| **Search bar** | Rounded input with search icon, in the navbar. Triggers Cmd+K command palette |
| **Favorite button** | Heart outline icon, overlaid on recipe images (top-right corner). Filled heart when favorited |
| **View count badge** | Small rounded badge overlaid on recipe image with eye icon + count (e.g., "100+") |

### Heading Accent Pattern

Throughout the app, section headings use a **split-color** pattern where one keyword is rendered in amber (`--color-primary`) while the rest is black:
- "Adventure of **Delicacies**"
- "Popular **Recipes** Today"
- "Cooking **Instructions**"
- "Related **Recipes**"
- "Explore **Culinary** Insights"
- "Ground **Beef** Mexican Tacos" (recipe title highlights main ingredient)

Implement as a reusable utility or component: `<AccentHeading>` or a simple `<span className="text-primary">` wrapper on the accented word.

---

## Phase 1: Project Setup & Foundation

### Step 1.1 - Initialize Next.js Project
- Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*" --yes`
- Verify `src/app/layout.tsx`, `tsconfig.json`, `next.config.ts` exist
- **Note**: Next.js 16 uses Turbopack as the default bundler for dev and production
- **Note**: Tailwind CSS v4 uses CSS-first configuration — no `tailwind.config.ts` file; theme is configured via `@theme` directives in CSS. The CSS import is a single `@import "tailwindcss";` replacing the old `@tailwind` directives.

### Step 1.2 - Initialize shadcn/ui
- Run `npx shadcn@latest init` (New York style, neutral base color, CSS variables)
- Install components: button, input, textarea, select, dialog, sheet, form, table, badge, tabs, calendar, checkbox, dropdown-menu, toast, separator, skeleton, command, popover, card
- **Note**: shadcn CLI 3.0+ now uses the unified `radix-ui` package instead of individual `@radix-ui/react-*` packages

### Step 1.3 - Install Dependencies
- **Production**: `@prisma/client`, `cheerio`, `slugify`, `date-fns`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `zod`, `next-themes`
- **Dev**: `prisma`
- **Note**: Zod 4.x has breaking changes — use `error` parameter instead of `message`, use `z.strictObject()` instead of `.strict()`, and `z.looseObject()` instead of `.passthrough()`

### Step 1.4 - Prisma + SQLite Setup
- Create `prisma.config.ts` at project root for datasource configuration (Prisma 7 requirement)
- Run `npx prisma init --datasource-provider sqlite`
- In `schema.prisma`, use `generator client { provider = "prisma-client" }` (not `"prisma-client-js"`)
- Define database schema with 12 models (see Database Schema section)
- Run `npx prisma migrate dev --name init`
- Create Prisma singleton at `src/lib/prisma.ts` (prevents multiple instances during hot reload)
- **Note**: Prisma 7 is ESM-only and ships as a pure TypeScript client (no Rust dependency)

### Step 1.5 - Create Base Layout
- **Root layout** (`src/app/layout.tsx`): HTML wrapper with Toaster provider, dark mode support, warm cream background (`--color-background`)
- **Navbar** (`src/components/layout/navbar.tsx`): Horizontal top navigation bar, sticky on scroll, white background with subtle bottom border
  - **Left**: App logo with split-color branding (first half black, second half amber `--color-primary`)
  - **Center**: Nav links — Home, Recipes, Meal Plan, Shopping Lists, Categories. Active route has amber dot indicator + bold text via `usePathname()`
  - **Right**: Search input (rounded, placeholder "Search...") + user avatar icon circle
  - Full-width, content max-width 1280px centered
- **Search Bar** (`src/components/layout/search-bar.tsx`): Cmd+K command palette (shadcn Command), also accessible from navbar search input. Navigates to `/recipes?q=term`
- **Footer** (`src/components/layout/footer.tsx`): Dark charcoal background (`--color-footer-bg`), logo with amber accent, tagline, multi-column links (Company, Support, Contact), newsletter email input with amber submit button, copyright line
- **Responsive**: Hamburger menu icon on mobile (<768px) triggers Sheet drawer overlay with nav links. Navbar collapses to logo + hamburger + avatar on mobile.
- **Dark mode toggle** via `next-themes` in navbar (sun/moon icon next to search)

### Step 1.6 - Utility Setup
- Extend `src/lib/utils.ts` with `formatDuration(minutes)`, `generateSlug(title)`, `formatDate(date)`
- Create `src/types/index.ts` with shared TypeScript types (RecipeWithRelations, RecipeFormData, MealType, Difficulty, SortOption, FilterState)
- Create `src/lib/validations/recipe.ts` with Zod schemas for form validation

### Step 1.7 - Verification
- [ ] `npm run dev` starts successfully on localhost:3000 (using Turbopack)
- [ ] Horizontal top navbar renders with logo (split-color), nav links, search input, avatar
- [ ] Active nav link is highlighted with amber accent
- [ ] Footer renders with dark charcoal background, multi-column links, newsletter input
- [ ] Page background is warm cream (`--color-background`)
- [ ] Dark mode toggle works
- [ ] Mobile view (<768px) shows hamburger menu with Sheet drawer
- [ ] `npx prisma studio` shows all 12 empty tables
- [ ] Tailwind v4 CSS-first config is working (no `tailwind.config.ts`, theme via `@theme` in CSS)

---

## Phase 2: Core Recipe Management

### Step 2.1 - Recipe Server Actions (`src/actions/recipe-actions.ts`)
- `createRecipe(data)`: Validate with Zod, generate slug (with collision handling), nested Prisma transaction for recipe + ingredients + instructions + categories + tags + nutrition, revalidate cache
- `updateRecipe(id, data)`: Validate, transaction to delete-and-recreate child records, update recipe fields, revalidate cache
- `deleteRecipe(id)`: Cascade delete, cleanup local image file if exists, revalidate cache
- `toggleFavorite(id)`: Toggle `isFavorite` boolean
- `rateRecipe(id, rating)`: Update rating (1-5)

### Step 2.2 - Data Query Functions (`src/lib/queries/recipe-queries.ts`)
- `getRecipes(params)`: Search via `contains` on title/description/ingredient names, filter by category/cuisine/difficulty/maxCookTime/tags, sort by date/name/cookTime/rating, paginate. Returns `{ recipes, total }`
- `getRecipeBySlug(slug)`: Full recipe with all relations included
- `getCategories()`: All categories with recipe counts
- `getTags()`: All tags
- `getCuisines()`: Distinct cuisine values from recipes

### Step 2.3 - Recipe List Page (`src/app/recipes/page.tsx`)
- Server component reading URL search params (`searchParams` is a Promise — async access required since Next.js 15+)
- **Hero banner** at top: Full-width rounded image with overlaid text "Explore **Culinary** Insights" (amber accent on "Culinary"), gradient overlay for legibility
- **Category filter pills** (`src/components/recipes/category-filter.tsx`): Horizontal scrollable row of pill-shaped buttons with emoji icons. "All Types" (active: amber fill + white text), "Appetizers", "Main Courses", "International Flavors", "Desserts & Sweets", etc. Active pill: amber fill. Inactive: white fill + border. Updates URL params on click.
- **Recipe Grid** (`src/components/recipes/recipe-grid.tsx`): Responsive CSS grid (1 col mobile, 2 col tablet, 3-4 col desktop)
- **Sort Controls** (`src/components/recipes/sort-controls.tsx`): Dropdown menu (Date Added, Name A-Z, Cook Time, Rating)

### Step 2.4 - Recipe Card (`src/components/recipes/recipe-card.tsx`)
- Vertical card layout with white background, rounded corners (12-16px), subtle shadow
- **Title** at top: Bold text, left-aligned
- **Image**: Rounded, 3:2 aspect ratio, below title. Fallback placeholder if no image
- **Overlays on image**: Heart/favorite icon (top-right), view count badge with eye icon (e.g., "250+") in corner
- **Optional metadata**: Difficulty badge, cuisine tag below image (small pills)
- **Footer bar**: "See Complete Recipe" text + amber accent arrow/heart icon, spanning full card width
- shadcn Card as base component

### Step 2.5 - Recipe Detail Page (`src/app/recipes/[slug]/page.tsx`)
- Server component fetching by slug (`params` is a Promise — async access required since Next.js 15+)
- **Hero banner**: Full-width rounded image with gradient overlay. "Let's Cook" label above title. Recipe title in large bold text with main ingredient highlighted in amber (e.g., "Ground **Beef** Mexican Tacos"). Heart/favorite icon overlay (top-right).
- **Metadata row**: Icon + label pairs in horizontal row with subtle dividers — Cuisine, Servings, Prep Time, Cook Time, Difficulty. Clean, centered layout.
- **Description**: Full text paragraph below metadata
- **Tags**: Amber text links below description (e.g., "Mexican Food, Tacos, Spicy")
- **Action buttons**: "Download Recipe PDF" amber pill button, edit/cook icons
- **Two-column content section**:
  - **Left - Ingredients card**: Warm cream background (`--color-surface-warm`), two-column ingredient list (quantity + unit + name per row), servings adjuster
  - **Right - Nutritional Info card**: Warm cream background, label + value per row (Calories, Protein, Carbs, Fat, Fiber, Sugars, Sodium)
- **Cooking Instructions section**: "Cooking **Instructions**" heading (amber accent). Each step as its own row — large amber step number (01, 02, 03...) on left, instruction text on right. Subtle card/row background per step.
- **Related Recipes section**: "Related **Recipes**" heading (amber accent). Horizontal scrollable carousel of recipe cards with prev/next arrows and page indicator (e.g., "1 / 2")
- Custom `not-found.tsx` for missing recipes

### Step 2.6 - Recipe Form (`src/components/recipes/recipe-form.tsx`)
- Client component with `react-hook-form` + `zodResolver`
- **Tabbed sections**:
  1. Basic Info: Title, description, cuisine, difficulty, source URL, image (upload/URL toggle)
  2. Times & Servings: Prep time, cook time, total time (auto-calc), servings
  3. Ingredients: Dynamic rows via `useFieldArray` - quantity (number), unit (select: cups/tbsp/tsp/oz/g/ml/etc), name (text), notes (text). Drag-to-reorder with @dnd-kit
  4. Instructions: Dynamic rows via `useFieldArray` - textarea per step. Drag-to-reorder
  5. Categories & Tags: Multi-select with typeahead (Command+Popover), create-new capability
  6. Nutrition: Optional number inputs for each nutrient
- On submit: upload image first (if file selected), then call create/update server action, redirect on success, toast on error
- Used by both `/recipes/new` and `/recipes/[slug]/edit`

### Step 2.7 - Image Upload (`src/app/api/upload/route.ts`)
- POST handler for multipart form data
- Validate: file type must be `image/*`, size must be <5MB
- Generate unique filename with timestamp
- Write to `/public/uploads/` directory
- Return `{ path: "/uploads/filename.jpg" }`
- **Image Upload Component** (`src/components/common/image-upload.tsx`): Drag-and-drop zone, file input fallback, preview, toggle between upload and URL input

### Step 2.8 - Verification
- [ ] Create a recipe with all fields filled (title, description, times, servings, difficulty, cuisine, ingredients, instructions, categories, tags, nutrition, image)
- [ ] View recipe in list page with correct card display
- [ ] View recipe detail page with all sections
- [ ] Edit recipe - all fields pre-populated, changes persist
- [ ] Delete recipe with confirmation dialog
- [ ] Toggle favorite from card and detail page
- [ ] Upload image and verify display
- [ ] Use URL image reference and verify display

---

## Phase 3: Recipe Import & Search

### Step 3.1 - Recipe Parser (`src/lib/recipe-parser.ts`)
- **Strategy 1 - JSON-LD** (preferred): Find `<script type="application/ld+json">`, parse JSON, handle `@graph` arrays, find `@type: "Recipe"` object
- **Strategy 2 - Microdata** (fallback): Extract from `itemtype="schema.org/Recipe"` attributes
- **Strategy 3 - HTML heuristics** (last resort): Title from `<h1>` or `og:title`, description from meta, image from `og:image`
- **Field mapping** from schema.org/Recipe:
  - `name` -> `title`
  - `prepTime`/`cookTime`/`totalTime` (ISO 8601 duration "PT30M") -> parse to minutes
  - `recipeYield` -> parse number for `servings`
  - `recipeIngredient` (string array) -> parse each into `{ quantity, unit, name }`
  - `recipeInstructions` -> handle string arrays and `HowToStep` objects
  - `recipeCategory` -> `categoryNames`
  - `recipeCuisine` -> `cuisine`
  - `image` -> `imageUrl` (handle string, array, `ImageObject`)
  - `nutrition.calories` etc. -> `nutrition`
- **Ingredient string parser**: Regex for "2 cups flour", "1/2 tsp salt", fractions (1/2, 1/4, 3/4), mixed numbers (1 1/2)

### Step 3.2 - Import Server Action (`src/actions/import-actions.ts`)
- `importRecipeFromUrl(url)`: Validate URL with Zod, call `parseRecipeFromUrl`, return parsed data (don't save yet - user reviews first)

### Step 3.3 - Import Page (`src/app/recipes/import/page.tsx`)
- **Step 1**: URL input with "Import" button, loading spinner
- **Step 2**: Preview extracted data in pre-filled RecipeForm, user reviews/edits and saves
- **Component** (`src/components/recipes/recipe-import.tsx`): Client component handling the two-step flow with error states

### Step 3.4 - Enhanced Global Search
- Cmd+K command palette in header (shadcn Command) that queries recipes by title and navigates to detail
- URL-based filter/search state on recipes page (survives refreshes)
- Helpful empty states when no recipes match filters

### Step 3.5 - Verification
- [ ] Import recipe from allrecipes.com - verify title, ingredients, instructions extracted correctly
- [ ] Import recipe from seriouseats.com - verify structured data extraction
- [ ] Try importing from a non-recipe URL - verify graceful error message
- [ ] Review and edit imported data before saving
- [ ] Search recipes by title using Cmd+K
- [ ] Search and filter on recipes page with URL params
- [ ] Verify filters combine correctly (category + difficulty + search term)

---

## Phase 4: Cooking Mode

### Step 4.1 - Cooking Mode Page (`src/app/recipes/[slug]/cook/page.tsx`)
- Server component that fetches recipe and renders client-side cooking mode component
- Full-screen layout with dark background, high-contrast white text, extra-large font (24px+ body)

### Step 4.2 - Cooking Mode Component (`src/components/recipes/cooking-mode.tsx`)
- **Layout**:
  - Progress bar at top
  - Step counter ("Step 3 of 8") displayed prominently
  - Current instruction text in large, readable font
  - Previous/Next navigation buttons (large touch targets, 44px+)
  - Exit button (top-left) to return to recipe detail
- **Interactions**:
  - Keyboard arrow keys for prev/next
  - Collapsible ingredients side panel for reference while cooking
- **Wake Lock** (`navigator.wakeLock.request("screen")`):
  - Prevent display sleep during cooking
  - Re-acquire on visibility change (tab switch)
  - Status indicator icon (lock/unlock)

### Step 4.3 - Recipe Scaling (`src/components/recipes/servings-adjuster.tsx`)
- +/- buttons to adjust servings count
- Auto-recalculate all ingredient quantities: `newQty = originalQty * (newServings / originalServings)`
- Display adjusted quantities in both cooking mode and recipe detail page
- Show original servings for reference

### Step 4.4 - Timer Component (`src/components/common/timer.tsx`)
- Support multiple independent timers simultaneously
- Each timer: label (optional), countdown display (MM:SS), play/pause/reset/delete buttons
- "Add Timer" button with duration input (minutes + seconds) and optional label
- Audio alert via Web Audio API when timer reaches zero
- Visual alert (flashing, color change)
- State managed with `useReducer` for clean timer management
- Timers use `setInterval` independently

### Step 4.5 - Verification
- [ ] Enter cooking mode from recipe detail page
- [ ] Navigate through all steps with buttons and keyboard arrows
- [ ] Verify progress bar advances correctly
- [ ] Open ingredients panel for reference
- [ ] Adjust servings and verify ingredient quantities recalculate correctly (e.g., 4 servings -> 8 servings doubles all quantities)
- [ ] Start multiple timers, verify they run independently
- [ ] Timer audio alert fires at zero
- [ ] Wake lock indicator shows active status
- [ ] Exit cooking mode returns to recipe detail

---

## Phase 5: Meal Planning

### Step 5.1 - Meal Plan Server Actions (`src/actions/meal-plan-actions.ts`)
- `getMealPlan(weekStart)`: Find-or-create MealPlan for the week (weekStart = Monday), return with entries including recipe details
- `addMealPlanEntry(data)`: Upsert entry for `{ weekStart, date, mealType, recipeId }`, handle unique constraint
- `removeMealPlanEntry(entryId)`: Delete entry, revalidate
- `moveMealPlanEntry(entryId, newDate, newMealType)`: Update entry's date and meal type (for drag-and-drop)

### Step 5.2 - Meal Plan Queries (`src/lib/queries/meal-plan-queries.ts`)
- `getMealPlanForWeek(weekStart)`: Full meal plan with entries and recipe details (title, image, slug)
- `getRecipesForQuickAdd(search?)`: Lightweight recipe list for the quick-add search dialog

### Step 5.3 - Meal Plan Page (`src/app/meal-plan/page.tsx`)
- Server component reading `week` from search params (default: current week)
- Calculate Monday via `date-fns` `startOfWeek` with `weekStartsOn: 1`
- Renders week calendar component

### Step 5.4 - Weekly Calendar Component (`src/components/meal-plan/week-calendar.tsx`)
- **Desktop layout**: 7 columns (Mon-Sun) x 4 rows (Breakfast/Lunch/Dinner/Snack) grid
- **Mobile layout**: Day-by-day accordion/list view with meals stacked vertically
- **Navigation**: Previous/Next week buttons, "Today" button, week label ("Feb 3 - Feb 9, 2026")
- **Drag-and-drop**: @dnd-kit `DndContext` with `useDraggable` / `useDroppable` for moving recipes between cells
- **Quick-add**: Click empty cell -> popover with recipe search -> select to add

### Step 5.5 - Meal Slot Component (`src/components/meal-plan/meal-slot.tsx`)
- Droppable zone for each cell
- Filled: Recipe thumbnail + title (draggable), remove (X) button
- Empty: "+" icon, clickable for quick-add

### Step 5.6 - Verification
- [ ] Navigate between weeks (prev/next/today)
- [ ] Add recipe to a meal slot via quick-add search
- [ ] Drag recipe from one slot to another
- [ ] Remove recipe from a slot
- [ ] Verify meal plan persists after page refresh
- [ ] Mobile view shows day-by-day layout
- [ ] Week label displays correct date range

---

## Phase 6: Shopping Lists

### Step 6.1 - Shopping List Server Actions (`src/actions/shopping-actions.ts`)
- `createShoppingList(name)`: Create empty list
- `deleteShoppingList(id)`: Delete list and all items
- `generateFromMealPlan(mealPlanId)`: Gather all ingredients from the week's recipes, consolidate, create list
- `generateFromRecipe(recipeId)`: Single recipe -> shopping list
- `addManualItem(listId, { name, quantity?, unit? })`: Add user-entered item
- `toggleItemChecked(itemId)`: Toggle checked state
- `clearCheckedItems(listId)`: Remove all checked items

### Step 6.2 - Ingredient Consolidation (`src/lib/ingredient-consolidator.ts`)
- Normalize ingredient names (lowercase, trim, basic plural handling)
- Group by normalized name + unit
- Sum quantities for matching name+unit pairs
- Basic unit conversions: 3 tsp = 1 tbsp, 16 tbsp = 1 cup, 1 cup = 240ml, 1 oz = 28.35g
- Keep items without quantities as-is (e.g., "salt to taste"), no duplicates
- Return sorted alphabetically

### Step 6.3 - Shopping List Pages
- **All Lists** (`src/app/shopping/page.tsx`): List of shopping list cards (name, item count, date), "New List" button, "Generate from Meal Plan" button (dialog to select week)
- **Single List** (`src/app/shopping/[id]/page.tsx`): Items grouped by unchecked/checked, each with checkbox + name + quantity badge, manual item input at bottom, "Clear Checked" button, "Add from Recipe" button

### Step 6.4 - Shopping List Components
- **Shopping List** (`src/components/shopping/shopping-list.tsx`): Client component with optimistic checkbox toggling, checked items move to bottom with strikethrough
- **Shopping Item** (`src/components/shopping/shopping-item.tsx`): Single row with checkbox, text, quantity

### Step 6.5 - Verification
- [ ] Create empty shopping list with custom name
- [ ] Generate shopping list from a meal plan week
- [ ] Verify ingredient consolidation (e.g., two recipes using flour -> combined quantity)
- [ ] Generate shopping list from a single recipe
- [ ] Check/uncheck items (optimistic UI, persists on refresh)
- [ ] Add manual items
- [ ] Clear checked items
- [ ] Delete shopping list

---

## Phase 7: Polish & Extras

### Step 7.1 - Dashboard Home Page (`src/app/page.tsx`)
- **Hero section**: Large heading "Adventure of **Delicacies**" (amber accent), subtitle text, food photography collage, "Explore Recipes" amber pill button + "Get Started" outline button
- **Value props row**: 3 cards with icons — "User-Centered", "Diverse Recipes", "Fun Community" — short description text per card
- **Popular Recipes carousel**: "Popular **Recipes** Today" heading (amber accent), horizontal scrollable recipe cards with prev/next arrows and page indicator (1/2)
- **Featured recipe card**: Highlighted recipe with image, audio/video element, "FEATURED" label, "See Recipe" link
- **Stats section**: "Become a true **chef** with our recipes" heading. Large amber stat numbers: total recipes, favorites count, meal plans this week
- **Quick action buttons**: "Add Recipe", "Import from URL", "Plan Meals", "Shopping List" — amber pill buttons
- **Upcoming meals**: Today's and tomorrow's planned meals from current week in compact card format
- **Testimonial card**: Quote with amber gradient background, user avatar, name, title

### Step 7.2 - Categories Page (`src/app/categories/page.tsx`)
- Grid of category cards with name, recipe count, representative image
- Click to navigate to `/recipes?category=slug`

### Step 7.3 - Dark Mode
- `next-themes` with class-based Tailwind dark mode (Tailwind v4: use `@variant dark (&:where(.dark, .dark *));` in CSS instead of `darkMode: "class"` in config)
- Theme toggle component (`src/components/common/theme-toggle.tsx`): Sun/moon icon toggle
- Store preference in localStorage, SSR-safe

### Step 7.4 - Loading States
- `src/app/recipes/loading.tsx`: Grid of Skeleton cards
- `src/app/recipes/[slug]/loading.tsx`: Recipe detail skeleton
- `src/app/meal-plan/loading.tsx`: Calendar skeleton
- `src/app/shopping/loading.tsx`: List skeleton
- All use shadcn Skeleton component for shimmer effects

### Step 7.5 - Error Handling
- `src/app/error.tsx`: Global error boundary with friendly message + "Try Again" button
- `src/app/recipes/error.tsx`: Recipe-specific error boundary
- `src/app/not-found.tsx`: Global 404 page
- `src/app/recipes/[slug]/not-found.tsx`: Recipe-specific 404

### Step 7.6 - Seed Data (`prisma/seed.ts`)
- 8-10 diverse sample recipes:
  - Italian (Pasta Carbonara, Margherita Pizza)
  - Mexican (Chicken Tacos, Guacamole)
  - Japanese (Miso Ramen, Teriyaki Salmon)
  - Indian (Butter Chicken, Dal Tadka)
  - American (Classic Cheeseburger, Chocolate Chip Cookies)
- Sample categories: Main Course, Dessert, Salad, Soup, Breakfast, Side Dish, Appetizer
- Sample tags: quick-meal, vegetarian, gluten-free, meal-prep, comfort-food
- Include proper ingredients, instructions, and some nutrition data
- Configure in `package.json` and run with `npx prisma db seed`

### Step 7.7 - Responsive Design Pass
- Recipe grid: 1 col mobile, 2 col tablet, 3-4 col desktop
- Navbar: Full horizontal on desktop, hamburger + Sheet drawer on mobile (<768px)
- Meal plan: Day list on mobile, full grid on desktop
- Recipe detail: Stack ingredients/nutrition vertically on mobile, side-by-side on desktop
- Forms: Single column mobile, two columns desktop where appropriate
- All interactive elements: 44x44px minimum touch targets
- Category filter pills: Horizontal scroll on mobile, wrap on desktop

### Step 7.8 - Verification
- [ ] Dashboard shows correct stats and recent recipes
- [ ] Category page lists all categories with correct counts
- [ ] Dark mode works across all pages
- [ ] Loading skeletons appear during navigation
- [ ] Error boundaries catch and display errors gracefully
- [ ] Seed data creates 8-10 recipes with full details
- [ ] Responsive design works at 375px (mobile), 768px (tablet), 1440px (desktop)

---

## Database Schema

### 12 Models

```
Recipe
├── id (cuid, PK)
├── title, slug (unique), description
├── prepTime, cookTime, totalTime (minutes)
├── servings, difficulty, cuisine
├── sourceUrl, imageUrl, imagePath
├── rating (1-5), isFavorite, notes
├── createdAt, updatedAt
├── -> RecipeIngredient[] (ingredients)
├── -> Instruction[] (steps)
├── -> CategoriesOnRecipes[] (categories)
├── -> TagsOnRecipes[] (tags)
├── -> Nutrition? (1:1)
└── -> MealPlanEntry[] (meal plans)

Ingredient
├── id (cuid, PK)
├── name (unique)
└── -> RecipeIngredient[] (recipes)

RecipeIngredient (junction)
├── id (cuid, PK)
├── quantity, unit, notes, order
├── recipeId -> Recipe (cascade delete)
├── ingredientId -> Ingredient
└── @@unique([recipeId, order])

Instruction
├── id (cuid, PK)
├── step, text
├── recipeId -> Recipe (cascade delete)
└── @@unique([recipeId, step])

Category
├── id (cuid, PK)
├── name (unique), slug (unique)
└── -> CategoriesOnRecipes[]

Tag
├── id (cuid, PK)
├── name (unique), slug (unique)
└── -> TagsOnRecipes[]

CategoriesOnRecipes (junction)
├── recipeId -> Recipe (cascade)
├── categoryId -> Category (cascade)
└── @@id([recipeId, categoryId])

TagsOnRecipes (junction)
├── recipeId -> Recipe (cascade)
├── tagId -> Tag (cascade)
└── @@id([recipeId, tagId])

Nutrition (1:1 with Recipe)
├── id (cuid, PK)
├── calories, protein, carbs, fat, fiber, sugar, sodium
├── recipeId (unique) -> Recipe (cascade)

MealPlan
├── id (cuid, PK)
├── weekStart (DateTime, Monday)
├── createdAt, updatedAt
└── -> MealPlanEntry[]

MealPlanEntry
├── id (cuid, PK)
├── date, mealType (breakfast/lunch/dinner/snack)
├── mealPlanId -> MealPlan (cascade)
├── recipeId -> Recipe
└── @@unique([mealPlanId, date, mealType])

ShoppingList
├── id (cuid, PK)
├── name, createdAt, updatedAt
└── -> ShoppingItem[]

ShoppingItem
├── id (cuid, PK)
├── name, quantity, unit
├── checked, isManual
└── shoppingListId -> ShoppingList (cascade)
```

---

## Architecture Decisions

1. **Server Components by default** - only `"use client"` for interactive components (forms, dnd, timers, theme toggle)
2. **Server Actions for mutations** - only API route is `/api/upload` for image file uploads
3. **URL-based search/filter state** - no client state management library needed
4. **Optimistic updates** via `useOptimistic` for favorites, shopping checkboxes, ratings
5. **Prisma 7 ESM-only** - use `prisma.config.ts` for datasource config, `"prisma-client"` generator provider
6. **Slug-based URLs** for recipes (`/recipes/pasta-carbonara`)
7. **Find-or-create pattern** for ingredients/categories/tags to prevent duplicates
8. **Tailwind v4 CSS-first config** - theme customization via `@theme` directives in CSS, no JS config file
9. **Turbopack** - default bundler in Next.js 16 for both dev and production
10. **Zod 4 validation** - use `z.strictObject()` / `z.looseObject()` patterns, `error` parameter for custom messages

---

## File Structure (~55 files)

```
src/
├── app/
│   ├── layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx, globals.css
│   ├── recipes/
│   │   ├── page.tsx, loading.tsx, error.tsx
│   │   ├── new/page.tsx
│   │   ├── import/page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx, loading.tsx, not-found.tsx
│   │       ├── edit/page.tsx
│   │       └── cook/page.tsx
│   ├── meal-plan/
│   │   ├── page.tsx, loading.tsx
│   ├── shopping/
│   │   ├── page.tsx, loading.tsx
│   │   └── [id]/page.tsx
│   ├── categories/
│   │   └── page.tsx
│   └── api/upload/route.ts
├── components/
│   ├── ui/                          # ~16 shadcn components (auto-generated)
│   ├── recipes/
│   │   ├── recipe-card.tsx
│   │   ├── recipe-form.tsx
│   │   ├── recipe-grid.tsx
│   │   ├── ingredient-input.tsx
│   │   ├── instruction-input.tsx
│   │   ├── cooking-mode.tsx
│   │   ├── recipe-import.tsx
│   │   ├── category-filter.tsx
│   │   ├── sort-controls.tsx
│   │   ├── related-recipes.tsx
│   │   └── servings-adjuster.tsx
│   ├── meal-plan/
│   │   ├── week-calendar.tsx
│   │   └── meal-slot.tsx
│   ├── shopping/
│   │   ├── shopping-list.tsx
│   │   └── shopping-item.tsx
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── search-bar.tsx
│   └── common/
│       ├── accent-heading.tsx
│       ├── image-upload.tsx
│       ├── timer.tsx
│       └── theme-toggle.tsx
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   ├── recipe-parser.ts
│   ├── ingredient-consolidator.ts
│   ├── validations/recipe.ts
│   └── queries/
│       ├── recipe-queries.ts
│       └── meal-plan-queries.ts
├── actions/
│   ├── recipe-actions.ts
│   ├── meal-plan-actions.ts
│   ├── shopping-actions.ts
│   └── import-actions.ts
└── types/
    └── index.ts
prisma/
├── schema.prisma
├── seed.ts
└── migrations/
public/
└── uploads/
```
