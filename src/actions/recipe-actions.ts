"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { recipeSchema } from "@/lib/validations/recipe";
import { generateSlug } from "@/lib/utils";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function findUniqueSlug(
  tx: TransactionClient,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const existing = await tx.recipe.findUnique({ where: { slug } });
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug;
    }
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

async function createChildRecords(
  tx: TransactionClient,
  recipeId: string,
  parsed: ReturnType<typeof recipeSchema.parse>
) {
  // Create ingredients (find-or-create + RecipeIngredient join)
  for (let i = 0; i < parsed.ingredients.length; i++) {
    const ing = parsed.ingredients[i];
    const ingredient = await tx.ingredient.upsert({
      where: { name: ing.name },
      create: { name: ing.name },
      update: {},
    });
    await tx.recipeIngredient.create({
      data: {
        recipeId,
        ingredientId: ingredient.id,
        quantity: ing.quantity ?? null,
        unit: ing.unit ?? null,
        notes: ing.notes ?? null,
        order: i + 1,
      },
    });
  }

  // Create instructions
  for (let i = 0; i < parsed.instructions.length; i++) {
    await tx.instruction.create({
      data: {
        recipeId,
        step: i + 1,
        text: parsed.instructions[i].text,
      },
    });
  }

  // Create categories (find-or-create + join)
  if (parsed.categoryNames) {
    for (const name of parsed.categoryNames) {
      const category = await tx.category.upsert({
        where: { name },
        create: { name, slug: generateSlug(name) },
        update: {},
      });
      await tx.categoriesOnRecipes.create({
        data: { recipeId, categoryId: category.id },
      });
    }
  }

  // Create tags (find-or-create + join)
  if (parsed.tagNames) {
    for (const name of parsed.tagNames) {
      const tag = await tx.tag.upsert({
        where: { name },
        create: { name, slug: generateSlug(name) },
        update: {},
      });
      await tx.tagsOnRecipes.create({
        data: { recipeId, tagId: tag.id },
      });
    }
  }

  // Create nutrition
  if (parsed.nutrition) {
    await tx.nutrition.create({
      data: {
        recipeId,
        calories: parsed.nutrition.calories ?? null,
        protein: parsed.nutrition.protein ?? null,
        carbs: parsed.nutrition.carbs ?? null,
        fat: parsed.nutrition.fat ?? null,
        fiber: parsed.nutrition.fiber ?? null,
        sugar: parsed.nutrition.sugar ?? null,
        sodium: parsed.nutrition.sodium ?? null,
      },
    });
  }
}

export async function createRecipe(data: unknown) {
  const parsed = recipeSchema.parse(data);
  const baseSlug = generateSlug(parsed.title);
  const computedTime = (parsed.prepTime ?? 0) + (parsed.cookTime ?? 0);
  const totalTime = parsed.totalTime ?? (computedTime || null);

  const recipe = await prisma.$transaction(async (tx) => {
    const slug = await findUniqueSlug(tx, baseSlug);

    const created = await tx.recipe.create({
      data: {
        title: parsed.title,
        slug,
        description: parsed.description ?? null,
        prepTime: parsed.prepTime ?? null,
        cookTime: parsed.cookTime ?? null,
        totalTime,
        servings: parsed.servings ?? null,
        difficulty: parsed.difficulty ?? null,
        cuisine: parsed.cuisine ?? null,
        sourceUrl: parsed.sourceUrl || null,
        imageUrl: parsed.imageUrl || null,
      },
    });

    await createChildRecords(tx, created.id, parsed);

    return created;
  });

  revalidatePath("/recipes");

  return { success: true as const, recipe: { id: recipe.id, slug: recipe.slug } };
}

export async function updateRecipe(id: string, data: unknown) {
  const parsed = recipeSchema.parse(data);
  const computedTime = (parsed.prepTime ?? 0) + (parsed.cookTime ?? 0);
  const totalTime = parsed.totalTime ?? (computedTime || null);

  const recipe = await prisma.$transaction(async (tx) => {
    const existing = await tx.recipe.findUniqueOrThrow({ where: { id } });

    // Regenerate slug if title changed
    let slug = existing.slug;
    if (parsed.title !== existing.title) {
      const baseSlug = generateSlug(parsed.title);
      slug = await findUniqueSlug(tx, baseSlug, id);
    }

    // Delete existing child records
    await tx.recipeIngredient.deleteMany({ where: { recipeId: id } });
    await tx.instruction.deleteMany({ where: { recipeId: id } });
    await tx.categoriesOnRecipes.deleteMany({ where: { recipeId: id } });
    await tx.tagsOnRecipes.deleteMany({ where: { recipeId: id } });
    await tx.nutrition.deleteMany({ where: { recipeId: id } });

    // Update recipe scalar fields
    const updated = await tx.recipe.update({
      where: { id },
      data: {
        title: parsed.title,
        slug,
        description: parsed.description ?? null,
        prepTime: parsed.prepTime ?? null,
        cookTime: parsed.cookTime ?? null,
        totalTime,
        servings: parsed.servings ?? null,
        difficulty: parsed.difficulty ?? null,
        cuisine: parsed.cuisine ?? null,
        sourceUrl: parsed.sourceUrl || null,
        imageUrl: parsed.imageUrl || null,
      },
    });

    // Recreate child records
    await createChildRecords(tx, id, parsed);

    return updated;
  });

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${recipe.slug}`);

  return { success: true as const, recipe: { id: recipe.id, slug: recipe.slug } };
}

export async function deleteRecipe(id: string) {
  const recipe = await prisma.recipe.findUniqueOrThrow({
    where: { id },
    select: { imagePath: true },
  });

  await prisma.recipe.delete({ where: { id } });

  // Clean up uploaded image file
  if (recipe.imagePath && recipe.imagePath.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", recipe.imagePath);
    try {
      await unlink(filePath);
    } catch (err: unknown) {
      if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  }

  revalidatePath("/recipes");

  return { success: true as const };
}

export async function toggleFavorite(id: string) {
  const current = await prisma.recipe.findUniqueOrThrow({
    where: { id },
    select: { isFavorite: true },
  });

  const updated = await prisma.recipe.update({
    where: { id },
    data: { isFavorite: !current.isFavorite },
  });

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${updated.slug}`);

  return { success: true as const, isFavorite: updated.isFavorite };
}

export async function rateRecipe(id: string, rating: number) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be an integer between 1 and 5");
  }

  const updated = await prisma.recipe.update({
    where: { id },
    data: { rating },
  });

  revalidatePath("/recipes");
  revalidatePath(`/recipes/${updated.slug}`);

  return { success: true as const, rating: updated.rating };
}
