import { RecipeCard } from "./recipe-card";
import type { RecipeWithRelations } from "@/types";

interface RecipeGridProps {
  recipes: RecipeWithRelations[];
}

export function RecipeGrid({ recipes }: RecipeGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-text-secondary">
          No recipes found. Try adjusting your filters or add a new recipe.
        </p>
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
