"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AccentHeading } from "@/components/common/accent-heading";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { createRecipe } from "@/actions/recipe-actions";
import type { RecipeFormData } from "@/lib/validations/recipe";

export default function NewRecipePage() {
  const router = useRouter();

  async function handleSubmit(data: RecipeFormData) {
    const result = await createRecipe(data);
    if (result.success) {
      toast.success("Recipe created successfully!");
      router.push(`/recipes/${result.recipe.slug}`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AccentHeading
        text="Create New Recipe"
        accentWord="New"
        as="h1"
        className="mb-8 text-3xl"
      />
      <RecipeForm onSubmit={handleSubmit} />
    </div>
  );
}
