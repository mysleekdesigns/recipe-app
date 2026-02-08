"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { toggleFavorite } from "@/actions/recipe-actions";
import type { RecipeWithRelations } from "@/types";

interface RecipeCardProps {
  recipe: RecipeWithRelations;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.imageUrl || recipe.imagePath || "/placeholder-recipe.jpg";
  const categoryName = recipe.categories?.[0]?.category?.name;

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(recipe.id);
  }

  return (
    <Card className="group overflow-hidden border-0 py-0 shadow-md transition-shadow hover:shadow-lg">
      {/* Title */}
      <CardContent className="px-4 pt-4 pb-0">
        <h3 className="line-clamp-2 text-lg font-bold text-text-primary">
          {recipe.title}
        </h3>
        {categoryName && (
          <span className="mt-1 text-sm text-text-secondary">{categoryName}</span>
        )}
      </CardContent>

      {/* Image */}
      <div className="relative mx-4 mt-3 overflow-hidden rounded-lg">
        <Link href={`/recipes/${recipe.slug}`}>
          <div className="relative aspect-[3/2]">
            <Image
              src={imageUrl}
              alt={recipe.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </Link>

        {/* Heart overlay */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white"
          aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              recipe.isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-600"
            )}
          />
        </button>

        {/* Cook time badge */}
        {recipe.cookTime && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 left-2 bg-white/80 text-text-primary backdrop-blur-sm"
          >
            {formatDuration(recipe.cookTime)}
          </Badge>
        )}
      </div>

      {/* Description */}
      {recipe.description && (
        <CardContent className="px-4 pt-3 pb-0">
          <p className="line-clamp-2 text-sm text-text-secondary">
            {recipe.description}
          </p>
        </CardContent>
      )}

      {/* Footer */}
      <CardFooter className="mt-auto border-t border-app-border px-4 py-3">
        <Link
          href={`/recipes/${recipe.slug}`}
          className="flex w-full items-center justify-between text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          See Complete Recipe
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
