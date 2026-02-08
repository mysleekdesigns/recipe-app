// Shared TypeScript types for the Recipe App

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Difficulty = "easy" | "medium" | "hard";

export type SortOption = "date" | "name" | "cookTime" | "rating";

export interface FilterState {
  category?: string;
  cuisine?: string;
  difficulty?: Difficulty;
  maxCookTime?: number;
  tags?: string[];
  search?: string;
}

export interface RecipeIngredient {
  id: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  order: number;
  ingredient: {
    id: string;
    name: string;
  };
}

export interface Instruction {
  id: string;
  step: number;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Nutrition {
  id: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  totalTime: number | null;
  servings: number | null;
  difficulty: Difficulty | null;
  cuisine: string | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  rating: number | null;
  isFavorite: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeWithRelations extends Recipe {
  ingredients: RecipeIngredient[];
  instructions: Instruction[];
  categories: { category: Category }[];
  tags: { tag: Tag }[];
  nutrition: Nutrition | null;
}

export interface RecipeFormData {
  title: string;
  description?: string;
  cuisine?: string;
  difficulty?: Difficulty;
  sourceUrl?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  servings?: number;
  ingredients: {
    quantity?: number;
    unit?: string;
    name: string;
    notes?: string;
  }[];
  instructions: {
    text: string;
  }[];
  categoryNames?: string[];
  tagNames?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}
