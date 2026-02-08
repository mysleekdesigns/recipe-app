import { RecipeCard } from "./recipe-card";
import type { RecipeWithRelations } from "@/types";

interface RecipeGridProps {
  recipes: RecipeWithRelations[];
  searchQuery?: string;
  activeCategory?: string;
}

export function RecipeGrid({ recipes, searchQuery, activeCategory }: RecipeGridProps) {
  if (recipes.length === 0) {
    let message = "No recipes found. Try adjusting your filters or add a new recipe.";
    if (searchQuery && activeCategory) {
      message = `No recipes found for "${searchQuery}" in this category. Try a different search term or remove the category filter.`;
    } else if (searchQuery) {
      message = `No recipes found for "${searchQuery}". Try a different search term.`;
    } else if (activeCategory) {
      message = "No recipes in this category yet. Try selecting a different category.";
    }

    return (
      <div className="py-16 text-center">
        <p className="text-lg text-text-secondary">{message}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
