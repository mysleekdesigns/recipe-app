# Recipe App - Agent Team Prompts

> **Prerequisites**: Enable agent teams by adding to your Claude Code `settings.json`:
> ```json
> {
>   "env": {
>     "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
>   }
> }
> ```
> Recommended: Use tmux or iTerm2 for split-pane mode so you can see all teammates working simultaneously.

---

## How to use

Copy the prompt for the phase you're about to work on and paste it into Claude Code. The lead will spawn teammates, assign tasks via the shared task list, and coordinate the work. Use **Shift+Tab** to enter delegate mode after the team spawns so the lead focuses on orchestration only.

Each phase is designed so teammates own **separate files** to avoid edit conflicts.

---

## Phase 1: Project Setup & Foundation

```
Read PRD.md for full project context. I'm building Phase 1 of a recipe app.

Create an agent team called "recipe-setup" with 3 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "scaffold": Initialize the Next.js 16 project, install all dependencies from the PRD tech stack table, and set up Tailwind v4 CSS-first configuration. Own files: package.json, tsconfig.json, next.config.ts, src/app/globals.css, and any root config files.

Teammate 2 - "database": Set up Prisma 7 with SQLite — create prisma.config.ts, schema.prisma with all 12 models from the PRD Database Schema section (use generator provider "prisma-client"), run the initial migration, create the Prisma singleton at src/lib/prisma.ts, and set up prisma/seed.ts with the package.json seed script. Own files: prisma/, src/lib/prisma.ts.

Teammate 3 - "layout": After scaffold finishes dependency installation, build the base layout following the Design System section in PRD.md exactly. This means: root layout with dark mode (next-themes) and warm cream background, horizontal top navbar (src/components/layout/navbar.tsx) with split-color logo, centered nav links, search input, and user avatar — NOT a sidebar. Also build the dark charcoal footer (src/components/layout/footer.tsx) with multi-column links and newsletter input, Cmd+K search bar (src/components/layout/search-bar.tsx), theme toggle (src/components/common/theme-toggle.tsx), accent heading component (src/components/common/accent-heading.tsx) for the split-color heading pattern, and utility functions (src/lib/utils.ts, src/types/index.ts, src/lib/validations/recipe.ts). Initialize shadcn/ui and install all required components listed in the PRD. Set up the Tailwind v4 @theme directives in globals.css with all color tokens from the Design System (--color-primary #F5A623, --color-background #FEF7EC, etc.). Own files: src/components/layout/, src/components/common/theme-toggle.tsx, src/components/common/accent-heading.tsx, src/components/ui/, src/lib/utils.ts, src/lib/validations/, src/types/, src/app/layout.tsx, src/app/globals.css (theme tokens only).

Set task dependencies: layout is blocked by scaffold (needs deps installed first). database can run in parallel with scaffold.

Only approve plans that follow the exact tech stack versions and patterns in PRD.md. Reject plans that use Tailwind v3 config files, Prisma's old "prisma-client-js" generator, or Zod 3 APIs.

Wait for all teammates to finish, then run "npm run dev" to verify the app starts. Report any issues.
```

---

## Phase 2: Core Recipe Management

```
Read PRD.md Phase 2 for full context. The project foundation (Phase 1) is already complete — Next.js 16, Prisma 7 with SQLite, shadcn/ui, Tailwind v4 are all set up.

Create an agent team called "recipe-core" with 4 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "actions": Build all recipe server actions at src/actions/recipe-actions.ts — createRecipe, updateRecipe, deleteRecipe, toggleFavorite, rateRecipe. Use Zod 4 validation (remember: use "error" param not "message", use z.strictObject() not .strict()). Use Prisma transactions for nested writes. Own files: src/actions/recipe-actions.ts.

Teammate 2 - "queries": Build all recipe query functions at src/lib/queries/recipe-queries.ts — getRecipes (with search/filter/sort/paginate), getRecipeBySlug, getCategories, getTags, getCuisines. Own files: src/lib/queries/recipe-queries.ts.

Teammate 3 - "pages": After actions and queries are done, build the recipe pages following the Design System section in PRD.md exactly. Recipe list page (src/app/recipes/page.tsx) with hero banner ("Explore Culinary Insights" with amber accent), horizontal scrollable category filter pills with emoji icons (not a sidebar), recipe grid, and sort controls. Recipe detail page (src/app/recipes/[slug]/page.tsx with not-found.tsx) with full-width hero banner image + gradient overlay + "Let's Cook" label + title with amber-highlighted ingredient word, metadata row with icon+label pairs, tags in amber, two-column ingredients/nutrition cards on warm cream background, numbered cooking instructions with large amber step numbers (01, 02...), and a "Related Recipes" horizontal carousel. Also build new page, edit page, recipe card component (vertical layout: title top, image below, "See Complete Recipe" footer bar, heart overlay, view count badge), category-filter.tsx, sort-controls.tsx, related-recipes.tsx, image upload API route, and image upload component. Remember: params and searchParams are Promises in Next.js 16. Own files: src/app/recipes/, src/components/recipes/recipe-grid.tsx, src/components/recipes/recipe-card.tsx, src/components/recipes/category-filter.tsx, src/components/recipes/sort-controls.tsx, src/components/recipes/related-recipes.tsx, src/app/api/upload/, src/components/common/image-upload.tsx.

Teammate 4 - "form": After actions are done, build the recipe form component at src/components/recipes/recipe-form.tsx with react-hook-form + Zod 4 resolver. Include all 6 tabbed sections from the PRD (Basic Info, Times & Servings, Ingredients with drag-and-drop, Instructions with drag-and-drop, Categories & Tags, Nutrition). Build ingredient-input.tsx and instruction-input.tsx as supporting components. Own files: src/components/recipes/recipe-form.tsx, src/components/recipes/ingredient-input.tsx, src/components/recipes/instruction-input.tsx.

Set task dependencies: pages is blocked by actions and queries. form is blocked by actions.

Only approve plans that use Zod 4 APIs, async params/searchParams, and @dnd-kit for drag-and-drop. Reject plans that use Zod 3 message/invalid_type_error params or synchronous params access.

Wait for all teammates to finish. Report the status of each task.
```

---

## Phase 3: Recipe Import & Search

```
Read PRD.md Phase 3 for full context. Phases 1-2 are complete — the recipe CRUD system is fully functional.

Create an agent team called "recipe-import" with 3 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "parser": Build the recipe parser at src/lib/recipe-parser.ts. Implement all 3 extraction strategies from the PRD: JSON-LD (primary), Microdata (fallback), HTML heuristics (last resort). Include the ingredient string parser for quantities/units/fractions. Use cheerio 1.2.x for HTML parsing. Parse ISO 8601 durations (PT30M -> 30 minutes). Own files: src/lib/recipe-parser.ts.

Teammate 2 - "import-flow": After parser is done, build the import server action (src/actions/import-actions.ts) and the import page (src/app/recipes/import/page.tsx) with the two-step flow: URL input -> preview in pre-filled RecipeForm. Build the recipe-import.tsx client component. Own files: src/actions/import-actions.ts, src/app/recipes/import/, src/components/recipes/recipe-import.tsx.

Teammate 3 - "search": Enhance the global search — improve the Cmd+K command palette in the header to query recipes by title and navigate to detail. Ensure URL-based filter/search state on the recipes page survives refreshes. Add helpful empty states when no recipes match. Own files: src/components/layout/search-bar.tsx (update existing), src/app/recipes/page.tsx (update empty states only).

Set task dependencies: import-flow is blocked by parser. search can run immediately.

Only approve plans that correctly handle schema.org/Recipe field mapping as specified in the PRD. Reject plans that skip JSON-LD parsing or don't handle @graph arrays.

Wait for all teammates to finish. Report the status of each task.
```

---

## Phase 4: Cooking Mode

```
Read PRD.md Phase 4 for full context. Phases 1-3 are complete — recipes can be created, imported, and searched.

Create an agent team called "recipe-cooking" with 3 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "cooking-mode": Build the cooking mode page (src/app/recipes/[slug]/cook/page.tsx) and the main cooking mode client component (src/components/recipes/cooking-mode.tsx). Full-screen dark layout, large text, step navigation with keyboard arrows, progress bar, collapsible ingredients panel, and Wake Lock API integration. Remember: params is a Promise in Next.js 16. Own files: src/app/recipes/[slug]/cook/, src/components/recipes/cooking-mode.tsx.

Teammate 2 - "scaling": Build the servings adjuster component (src/components/recipes/servings-adjuster.tsx). +/- buttons to adjust servings, auto-recalculate ingredient quantities proportionally, display in both cooking mode and recipe detail page. Own files: src/components/recipes/servings-adjuster.tsx.

Teammate 3 - "timers": Build the timer component (src/components/common/timer.tsx). Support multiple independent simultaneous timers, each with label/countdown/play/pause/reset/delete. "Add Timer" button with duration input. Audio alert via Web Audio API at zero, visual flashing alert. Use useReducer for state management. Own files: src/components/common/timer.tsx.

All 3 teammates can work in parallel — no dependencies between them. cooking-mode will import the scaling and timer components, but can use placeholder imports initially.

After all teammates finish, verify that cooking-mode correctly imports and integrates servings-adjuster and timer. Fix any integration issues.

Wait for all teammates to finish. Report the status of each task.
```

---

## Phase 5: Meal Planning

```
Read PRD.md Phase 5 for full context. Phases 1-4 are complete — recipes, import, cooking mode all work.

Create an agent team called "recipe-mealplan" with 3 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "mealplan-backend": Build meal plan server actions (src/actions/meal-plan-actions.ts) and query functions (src/lib/queries/meal-plan-queries.ts). Include getMealPlan (find-or-create for week), addMealPlanEntry, removeMealPlanEntry, moveMealPlanEntry, getMealPlanForWeek, getRecipesForQuickAdd. Use date-fns 4.x for date calculations (startOfWeek with weekStartsOn: 1). Own files: src/actions/meal-plan-actions.ts, src/lib/queries/meal-plan-queries.ts.

Teammate 2 - "mealplan-calendar": After backend is done, build the meal plan page (src/app/meal-plan/page.tsx with loading.tsx) and the weekly calendar component (src/components/meal-plan/week-calendar.tsx). Desktop: 7-column grid (Mon-Sun) x 4 rows (meals). Mobile: day-by-day accordion. Week navigation (prev/next/today). Integrate @dnd-kit DndContext for drag-and-drop between cells. Quick-add popover with recipe search. Own files: src/app/meal-plan/, src/components/meal-plan/week-calendar.tsx.

Teammate 3 - "mealplan-slot": After backend is done, build the meal slot component (src/components/meal-plan/meal-slot.tsx). Droppable zone with @dnd-kit useDroppable. Filled state: draggable recipe thumbnail + title + remove button. Empty state: "+" icon for quick-add. Own files: src/components/meal-plan/meal-slot.tsx.

Set task dependencies: mealplan-calendar and mealplan-slot are both blocked by mealplan-backend.

Only approve plans that use @dnd-kit (not react-beautiful-dnd or other libraries) and date-fns 4.x.

Wait for all teammates to finish. Report the status of each task.
```

---

## Phase 6: Shopping Lists

```
Read PRD.md Phase 6 for full context. Phases 1-5 are complete — recipes, import, cooking, and meal planning all work.

Create an agent team called "recipe-shopping" with 3 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "shopping-backend": Build shopping list server actions (src/actions/shopping-actions.ts) and the ingredient consolidation module (src/lib/ingredient-consolidator.ts). Actions: createShoppingList, deleteShoppingList, generateFromMealPlan, generateFromRecipe, addManualItem, toggleItemChecked, clearCheckedItems. Consolidation: normalize names, group by name+unit, sum quantities, basic unit conversions (tsp/tbsp/cup/ml/oz/g as specified in PRD). Own files: src/actions/shopping-actions.ts, src/lib/ingredient-consolidator.ts.

Teammate 2 - "shopping-pages": After backend is done, build the shopping list pages — all lists page (src/app/shopping/page.tsx with loading.tsx) and single list page (src/app/shopping/[id]/page.tsx). All lists: cards with name/count/date, "New List" and "Generate from Meal Plan" buttons. Single list: items grouped by checked/unchecked, manual item input, "Clear Checked" button, "Add from Recipe" button. Own files: src/app/shopping/.

Teammate 3 - "shopping-components": After backend is done, build the shopping list client components — shopping-list.tsx (optimistic checkbox toggling with useOptimistic, checked items to bottom with strikethrough) and shopping-item.tsx (checkbox + text + quantity). Own files: src/components/shopping/.

Set task dependencies: shopping-pages and shopping-components are both blocked by shopping-backend.

Wait for all teammates to finish. Report the status of each task.
```

---

## Phase 7: Polish & Extras

```
Read PRD.md Phase 7 for full context. Phases 1-6 are complete — all core features work.

Create an agent team called "recipe-polish" with 4 teammates. Use Sonnet for each teammate. Require plan approval before any teammate makes changes.

Teammate 1 - "dashboard": Build the dashboard home page (src/app/page.tsx) following the Design System in PRD.md. Hero section with "Adventure of Delicacies" heading (amber accent on "Delicacies"), food photography, "Explore Recipes" amber pill button. Value props row (3 icon cards). "Popular Recipes Today" carousel with amber heading accent and prev/next arrows. Featured recipe card. Stats section with large amber numbers. Quick action buttons. Upcoming meals from current week. Testimonial card with amber gradient background. Use the AccentHeading component for split-color headings. Own files: src/app/page.tsx.

Teammate 2 - "categories": Build the categories page (src/app/categories/page.tsx). Grid of category cards with name, recipe count, representative image. Click navigates to /recipes?category=slug. Own files: src/app/categories/.

Teammate 3 - "loading-errors": Build all loading and error states across the app. Loading skeletons: src/app/recipes/loading.tsx, src/app/recipes/[slug]/loading.tsx, src/app/meal-plan/loading.tsx, src/app/shopping/loading.tsx, src/app/loading.tsx. Error boundaries: src/app/error.tsx, src/app/recipes/error.tsx. 404 pages: src/app/not-found.tsx, src/app/recipes/[slug]/not-found.tsx (update if exists). Use shadcn Skeleton for shimmer effects. Own files: all loading.tsx, error.tsx, and not-found.tsx files.

Teammate 4 - "seed-data": Build comprehensive seed data in prisma/seed.ts. 8-10 diverse recipes (Italian, Mexican, Japanese, Indian, American as listed in PRD) with full ingredients, instructions, nutrition data. Sample categories (Main Course, Dessert, Salad, Soup, Breakfast, Side Dish, Appetizer). Sample tags (quick-meal, vegetarian, gluten-free, meal-prep, comfort-food). Ensure package.json has the prisma seed script configured. Own files: prisma/seed.ts, package.json (seed script only).

All 4 teammates can work in parallel — no dependencies.

After all teammates finish, run "npx prisma db seed" to populate the database with seed data, then run "npm run dev" and verify the dashboard, categories, loading states, and error boundaries all work. Report any issues.
```

---

## Tips

- **Delegate mode**: After the team spawns, press **Shift+Tab** to enter delegate mode. This prevents the lead from implementing tasks itself.
- **Monitor progress**: Use **Shift+Up/Down** to cycle between teammates, or **Ctrl+T** to toggle the shared task list.
- **Direct messaging**: Select a teammate with **Shift+Up/Down** and type to give them additional instructions.
- **If a teammate gets stuck**: Message them directly with clarifying instructions, or ask the lead to spawn a replacement.
- **Quality gates**: The prompts above use "require plan approval" so the lead reviews each teammate's approach before they write code. This catches architectural mistakes early.
- **File conflicts**: Each teammate is assigned specific file ownership. If you see a conflict, message the lead to coordinate.
- **Clean up**: When a phase is done, tell the lead: `Clean up the team`
