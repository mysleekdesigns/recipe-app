"use server";

import { prisma } from "@/lib/prisma";

export async function searchRecipes(query: string) {
  if (!query || query.length < 2) return [];
  return prisma.recipe.findMany({
    where: { title: { contains: query } },
    select: { id: true, title: true, slug: true, cuisine: true, cookTime: true },
    take: 5,
    orderBy: { title: "asc" },
  });
}
