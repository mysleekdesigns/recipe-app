"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { updateRecipe } from "@/actions/recipe-actions";
import type { RecipeFormData } from "@/lib/validations/recipe";

interface EditRecipeClientProps {
  recipeId: string;
  defaultValues: Partial<RecipeFormData>;
}

export function EditRecipeClient({ recipeId, defaultValues }: EditRecipeClientProps) {
  const router = useRouter();

  async function handleSubmit(data: RecipeFormData) {
    const result = await updateRecipe(recipeId, data);
    if (result.success) {
      toast.success("Recipe updated successfully!");
      router.push(`/recipes/${result.recipe.slug}`);
    }
  }

  return (
    <RecipeForm
      onSubmit={handleSubmit}
      defaultValues={defaultValues}
      isEditing
    />
  );
}
