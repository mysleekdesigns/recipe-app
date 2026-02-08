"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "./recipe-card";
import type { RecipeWithRelations } from "@/types";

interface RelatedRecipesProps {
  recipes: RecipeWithRelations[];
  currentRecipeId: string;
}

export function RelatedRecipes({ recipes, currentRecipeId }: RelatedRecipesProps) {
  const filtered = recipes.filter((r) => r.id !== currentRecipeId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  if (filtered.length === 0) return null;

  const cardsPerPage = 3;
  const totalPages = Math.ceil(filtered.length / cardsPerPage);

  function scroll(direction: "prev" | "next") {
    const container = scrollRef.current;
    if (!container) return;

    const newPage = direction === "next"
      ? Math.min(page + 1, totalPages - 1)
      : Math.max(page - 1, 0);

    setPage(newPage);
    const cardWidth = container.scrollWidth / filtered.length;
    container.scrollTo({
      left: newPage * cardsPerPage * cardWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-text-secondary">
          {page + 1} / {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("prev")}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => scroll("next")}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-hidden"
      >
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            className="w-full shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>
    </div>
  );
}
