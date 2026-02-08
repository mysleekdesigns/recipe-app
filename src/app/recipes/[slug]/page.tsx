import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Globe, Users, Clock, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AccentHeading } from "@/components/common/accent-heading";
import { RelatedRecipes } from "@/components/recipes/related-recipes";
import { getRecipeBySlug, getRecipes } from "@/lib/queries/recipe-queries";
import { formatDuration } from "@/lib/utils";

interface RecipeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RecipeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return { title: "Recipe Not Found" };
  }

  return {
    title: `${recipe.title} - RecipeApp`,
    description: recipe.description || `Learn how to make ${recipe.title}`,
    openGraph: {
      title: recipe.title,
      description: recipe.description || undefined,
      images: recipe.imageUrl ? [recipe.imageUrl] : undefined,
    },
  };
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const imageUrl = recipe.imageUrl || recipe.imagePath || "/placeholder-recipe.jpg";

  // Get related recipes (same category or recent)
  const categorySlug = recipe.categories?.[0]?.category?.slug;
  const { recipes: relatedRecipes } = await getRecipes({
    category: categorySlug,
    pageSize: 6,
  });

  const metadataItems = [
    recipe.cuisine && { icon: Globe, label: "Cuisine", value: recipe.cuisine },
    recipe.servings && { icon: Users, label: "Servings", value: `${recipe.servings}` },
    recipe.prepTime && { icon: Clock, label: "Prep Time", value: formatDuration(recipe.prepTime) },
    recipe.cookTime && { icon: Clock, label: "Cook Time", value: formatDuration(recipe.cookTime) },
    recipe.difficulty && { icon: ChefHat, label: "Difficulty", value: recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1) },
  ].filter(Boolean) as { icon: typeof Globe; label: string; value: string }[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Banner */}
      <section className="relative mb-8 overflow-hidden rounded-2xl">
        <div className="relative aspect-[21/9] w-full">
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-6 sm:p-10">
          <Badge className="mb-3 bg-primary text-white">
            Let&apos;s Cook
          </Badge>
          <AccentHeading
            text={recipe.title}
            accentWord={recipe.title.split(" ").pop() || recipe.title}
            as="h1"
            className="text-3xl text-white sm:text-4xl lg:text-5xl"
          />
        </div>
      </section>

      {/* Metadata Row */}
      {metadataItems.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-6">
          {metadataItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-text-secondary">
              <item.icon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-text-secondary">{item.label}</p>
                <p className="text-sm font-semibold text-text-primary">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {recipe.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="secondary" className="bg-primary-light text-primary">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Two Column: Ingredients + Nutrition */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Ingredients */}
        <div className="rounded-xl bg-surface-warm p-6">
          <AccentHeading
            text="Fresh Ingredients"
            accentWord="Ingredients"
            as="h2"
            className="mb-4 text-2xl"
          />
          <ul className="space-y-3">
            {recipe.ingredients.map((ri) => (
              <li key={ri.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="text-text-primary">
                  {ri.quantity && <span className="font-semibold">{ri.quantity}</span>}
                  {ri.unit && <span> {ri.unit}</span>}
                  {" "}
                  <span className="text-primary font-medium">{ri.ingredient.name}</span>
                  {ri.notes && <span className="text-text-secondary"> ({ri.notes})</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Nutrition */}
        {recipe.nutrition && (
          <div className="rounded-xl bg-surface-warm p-6">
            <AccentHeading
              text="Nutrition Facts"
              accentWord="Nutrition"
              as="h2"
              className="mb-4 text-2xl"
            />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Calories", value: recipe.nutrition.calories, unit: "kcal" },
                { label: "Protein", value: recipe.nutrition.protein, unit: "g" },
                { label: "Carbs", value: recipe.nutrition.carbs, unit: "g" },
                { label: "Fat", value: recipe.nutrition.fat, unit: "g" },
                { label: "Fiber", value: recipe.nutrition.fiber, unit: "g" },
                { label: "Sugar", value: recipe.nutrition.sugar, unit: "g" },
                { label: "Sodium", value: recipe.nutrition.sodium, unit: "mg" },
              ]
                .filter((n) => n.value != null)
                .map((n) => (
                  <div key={n.label} className="rounded-lg bg-white/60 p-3 text-center">
                    <p className="text-xs text-text-secondary">{n.label}</p>
                    <p className="text-lg font-bold text-text-primary">
                      {n.value}
                      <span className="text-xs font-normal text-text-secondary"> {n.unit}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Cooking Instructions */}
      {recipe.instructions.length > 0 && (
        <section className="mb-8">
          <AccentHeading
            text="Cooking Instructions"
            accentWord="Instructions"
            as="h2"
            className="mb-6 text-2xl"
          />
          <div className="space-y-6">
            {recipe.instructions.map((instruction) => (
              <div key={instruction.id} className="flex gap-4">
                <span className="shrink-0 text-3xl font-bold text-primary">
                  {String(instruction.step).padStart(2, "0")}
                </span>
                <div className="pt-1">
                  <p className="text-text-primary leading-relaxed">{instruction.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Recipes */}
      {relatedRecipes.length > 1 && (
        <section>
          <AccentHeading
            text="Related Recipes"
            accentWord="Related"
            as="h2"
            className="mb-6 text-2xl"
          />
          <RelatedRecipes recipes={relatedRecipes} currentRecipeId={recipe.id} />
        </section>
      )}
    </div>
  );
}
