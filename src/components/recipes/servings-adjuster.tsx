"use client";

import { useState, useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RecipeIngredient } from "@/types";

interface ServingsAdjusterProps {
  originalServings: number | null;
  ingredients: RecipeIngredient[];
  onServingsChange?: (newServings: number) => void;
  className?: string;
}

function formatQuantity(qty: number): string {
  const rounded = Math.round(qty * 100) / 100;
  return String(rounded);
}

export function ServingsAdjuster({
  originalServings,
  ingredients,
  onServingsChange,
  className,
}: ServingsAdjusterProps) {
  const baseServings = originalServings ?? 1;
  const [servings, setServings] = useState(baseServings);

  const scaledIngredients = useMemo(() => {
    const ratio = servings / baseServings;
    return ingredients
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((ing) => ({
        ...ing,
        scaledQuantity:
          ing.quantity != null ? ing.quantity * ratio : null,
      }));
  }, [servings, baseServings, ingredients]);

  function updateServings(next: number) {
    if (next < 1) return;
    setServings(next);
    onServingsChange?.(next);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => updateServings(servings - 1)}
          disabled={servings <= 1}
          aria-label="Decrease servings"
        >
          <Minus className="size-4" />
        </Button>

        <div className="text-center min-w-[4rem]">
          <span className="text-2xl font-bold text-primary">{servings}</span>
          <p className="text-xs text-text-secondary">
            {servings === 1 ? "serving" : "servings"}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => updateServings(servings + 1)}
          aria-label="Increase servings"
        >
          <Plus className="size-4" />
        </Button>

        {originalServings != null && servings !== baseServings && (
          <span className="text-xs text-text-secondary ml-1">
            Original: {originalServings} {originalServings === 1 ? "serving" : "servings"}
          </span>
        )}
      </div>

      <ul className="space-y-1.5">
        {scaledIngredients.map((ing) => (
          <li key={ing.id} className="flex items-baseline gap-1.5 text-sm">
            {ing.scaledQuantity != null && (
              <span className="font-medium tabular-nums">
                {formatQuantity(ing.scaledQuantity)}
              </span>
            )}
            {ing.unit && (
              <span className="text-text-secondary">{ing.unit}</span>
            )}
            <span>{ing.ingredient.name}</span>
            {ing.notes && (
              <span className="text-text-secondary text-xs">({ing.notes})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
