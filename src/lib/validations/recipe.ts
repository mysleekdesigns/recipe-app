import { z } from "zod";

// Recipe ingredient schema
const recipeIngredientSchema = z.strictObject({
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  name: z.string().min(1, { error: "Ingredient name is required" }),
  notes: z.string().optional(),
});

// Recipe instruction schema
const recipeInstructionSchema = z.strictObject({
  text: z.string().min(1, { error: "Instruction text is required" }),
});

// Nutrition schema
const nutritionSchema = z.strictObject({
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  fiber: z.number().nonnegative().optional(),
  sugar: z.number().nonnegative().optional(),
  sodium: z.number().nonnegative().optional(),
});

// Main recipe schema
export const recipeSchema = z.strictObject({
  title: z.string().min(1, { error: "Title is required" }).max(200, { error: "Title must be less than 200 characters" }),
  description: z.string().optional(),
  cuisine: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  sourceUrl: z.string().url({ error: "Must be a valid URL" }).optional().or(z.literal("")),
  imageUrl: z.string().url({ error: "Must be a valid URL" }).optional().or(z.literal("")),
  prepTime: z.number().nonnegative({ error: "Prep time must be a positive number" }).optional(),
  cookTime: z.number().nonnegative({ error: "Cook time must be a positive number" }).optional(),
  totalTime: z.number().nonnegative({ error: "Total time must be a positive number" }).optional(),
  servings: z.number().positive({ error: "Servings must be a positive number" }).optional(),
  ingredients: z.array(recipeIngredientSchema).min(1, { error: "At least one ingredient is required" }),
  instructions: z.array(recipeInstructionSchema).min(1, { error: "At least one instruction is required" }),
  categoryNames: z.array(z.string()).optional(),
  tagNames: z.array(z.string()).optional(),
  nutrition: nutritionSchema.optional(),
});

// URL import schema
export const importUrlSchema = z.strictObject({
  url: z.string().url({ error: "Please enter a valid URL" }),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;
export type ImportUrlData = z.infer<typeof importUrlSchema>;
