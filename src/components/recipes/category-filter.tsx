"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const emojiMap: Record<string, string> = {
  "Appetizers": "\u{1F957}",
  "Main Course": "\u{1F356}",
  "Dessert": "\u{1F370}",
  "Soup": "\u{1F372}",
  "Salad": "\u{1F96C}",
  "Breakfast": "\u{1F373}",
  "Side Dish": "\u{1F958}",
  "International": "\u{1F30D}",
};

interface CategoryFilterProps {
  categories: (Category & { _count?: { recipes: number } })[];
  activeCategory?: string;
}

export function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSelect(slug?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`/recipes?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {/* All pill */}
      <button
        onClick={() => handleSelect()}
        className={cn(
          "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          !activeCategory
            ? "bg-primary text-white"
            : "border border-app-border bg-white text-text-primary hover:bg-gray-50"
        )}
      >
        All
      </button>

      {categories.map((cat) => {
        const emoji = emojiMap[cat.name] || "\u{1F37D}\u{FE0F}";
        const isActive = activeCategory === cat.slug;

        return (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.slug)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-white"
                : "border border-app-border bg-white text-text-primary hover:bg-gray-50"
            )}
          >
            {emoji} {cat.name}
          </button>
        );
      })}
    </div>
  );
}
