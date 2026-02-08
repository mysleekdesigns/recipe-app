import { notFound } from "next/navigation";
import { AccentHeading } from "@/components/common/accent-heading";
import { getRecipeBySlug } from "@/lib/queries/recipe-queries";
import { EditRecipeClient } from "./edit-client";

interface EditRecipePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const defaultValues = {
    title: recipe.title,
    description: recipe.description || undefined,
    cuisine: recipe.cuisine || undefined,
    difficulty: recipe.difficulty || undefined,
    sourceUrl: recipe.sourceUrl || undefined,
    imageUrl: recipe.imageUrl || undefined,
    prepTime: recipe.prepTime || undefined,
    cookTime: recipe.cookTime || undefined,
    totalTime: recipe.totalTime || undefined,
    servings: recipe.servings || undefined,
    ingredients: recipe.ingredients.map((ri) => ({
      quantity: ri.quantity || undefined,
      unit: ri.unit || undefined,
      name: ri.ingredient.name,
      notes: ri.notes || undefined,
    })),
    instructions: recipe.instructions.map((inst) => ({
      text: inst.text,
    })),
    categoryNames: recipe.categories.map((c) => c.category.name),
    tagNames: recipe.tags.map((t) => t.tag.name),
    nutrition: recipe.nutrition
      ? {
          calories: recipe.nutrition.calories || undefined,
          protein: recipe.nutrition.protein || undefined,
          carbs: recipe.nutrition.carbs || undefined,
          fat: recipe.nutrition.fat || undefined,
          fiber: recipe.nutrition.fiber || undefined,
          sugar: recipe.nutrition.sugar || undefined,
          sodium: recipe.nutrition.sodium || undefined,
        }
      : undefined,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AccentHeading
        text="Edit Recipe"
        accentWord="Edit"
        as="h1"
        className="mb-8 text-3xl"
      />
      <EditRecipeClient recipeId={recipe.id} defaultValues={defaultValues} />
    </div>
  );
}
