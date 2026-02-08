import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeBySlug } from "@/lib/queries/recipe-queries";
import { CookingMode } from "@/components/recipes/cooking-mode";

interface CookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return { title: "Recipe Not Found" };
  }

  return {
    title: `Cooking: ${recipe.title} - RecipeApp`,
    description: `Step-by-step cooking mode for ${recipe.title}`,
  };
}

export default async function CookPage({ params }: CookPageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return <CookingMode recipe={recipe} />;
}
