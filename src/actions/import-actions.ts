"use server";

import { importUrlSchema } from "@/lib/validations/recipe";
import { parseRecipeFromUrl, type ParsedRecipe } from "@/lib/recipe-parser";

type ImportResult =
  | { success: true; data: ParsedRecipe }
  | { success: false; error: string };

export async function importRecipeFromUrl(url: string): Promise<ImportResult> {
  try {
    importUrlSchema.parse({ url });
    const data = await parseRecipeFromUrl(url);
    return { success: true, data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to import recipe";
    return { success: false, error: message };
  }
}
