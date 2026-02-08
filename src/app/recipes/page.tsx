import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccentHeading } from "@/components/common/accent-heading";
import { RecipeGrid } from "@/components/recipes/recipe-grid";
import { CategoryFilter } from "@/components/recipes/category-filter";
import { SortControls } from "@/components/recipes/sort-controls";
import { getRecipes } from "@/lib/queries/recipe-queries";
import { getCategories } from "@/lib/queries/recipe-queries";
import type { SortOption } from "@/types";

interface RecipeListPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function RecipeListPage({ searchParams }: RecipeListPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = (params.sort as SortOption) || "date";
  const page = Number(params.page) || 1;
  const q = params.q;

  const [{ recipes, total }, categories] = await Promise.all([
    getRecipes({ search: q, category, sort, page, pageSize: 12 }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <section className="mb-8 rounded-2xl bg-gradient-to-r from-primary/20 to-primary-light px-8 py-12 text-center">
        <AccentHeading
          text="Explore Culinary Insights"
          accentWord="Culinary"
          as="h1"
          className="mb-3 text-3xl sm:text-4xl"
        />
        <p className="mx-auto max-w-xl text-text-secondary">
          Discover delicious recipes from around the world, curated just for you.
        </p>
      </section>

      {/* Active Search Indicator */}
      {q && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-app-border bg-surface px-4 py-2 text-sm">
          <span className="text-text-secondary">
            Showing results for{" "}
            <strong className="text-text-primary">&ldquo;{q}&rdquo;</strong>
          </span>
          <Button variant="ghost" size="sm" className="ml-auto h-7 px-2" asChild>
            <Link
              href={{
                pathname: "/recipes",
                query: {
                  ...(category && { category }),
                  ...(sort !== "date" && { sort }),
                },
              }}
            >
              <X className="mr-1 h-3 w-3" />
              Clear search
            </Link>
          </Button>
        </div>
      )}

      {/* Controls Row */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter categories={categories} activeCategory={category} />
        <div className="flex items-center gap-3">
          <SortControls activeSort={sort} />
          <Button asChild className="bg-primary hover:bg-primary-hover">
            <Link href="/recipes/new">
              <Plus className="mr-1 h-4 w-4" /> Add Recipe
            </Link>
          </Button>
        </div>
      </div>

      {/* Recipe Grid */}
      <RecipeGrid
        recipes={recipes}
        searchQuery={q}
        activeCategory={category}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/recipes",
                  query: {
                    ...(q && { q }),
                    ...(category && { category }),
                    ...(sort !== "date" && { sort }),
                    page: page - 1,
                  },
                }}
              >
                Previous
              </Link>
            </Button>
          )}
          <span className="px-4 text-sm text-text-secondary">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link
                href={{
                  pathname: "/recipes",
                  query: {
                    ...(q && { q }),
                    ...(category && { category }),
                    ...(sort !== "date" && { sort }),
                    page: page + 1,
                  },
                }}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
