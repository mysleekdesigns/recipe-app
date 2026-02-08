import * as cheerio from "cheerio";
import type { RecipeFormData } from "@/types";

// Re-export RecipeFormData as ParsedRecipe for external consumers
export type ParsedRecipe = RecipeFormData;

// ---------------------------------------------------------------------------
// Internal types for schema.org Recipe JSON-LD / Microdata
// ---------------------------------------------------------------------------

interface SchemaRecipe {
  name?: string;
  description?: string;
  image?: unknown;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: unknown;
  recipeIngredient?: string[];
  recipeInstructions?: unknown[];
  recipeCategory?: unknown;
  recipeCuisine?: unknown;
  nutrition?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Unicode fraction map
// ---------------------------------------------------------------------------

const UNICODE_FRACTIONS: Record<string, number> = {
  "\u00BD": 0.5,    // ½
  "\u2153": 0.333,  // ⅓
  "\u2154": 0.667,  // ⅔
  "\u00BC": 0.25,   // ¼
  "\u00BE": 0.75,   // ¾
  "\u2155": 0.2,    // ⅕
  "\u2156": 0.4,    // ⅖
  "\u2157": 0.6,    // ⅗
  "\u2158": 0.8,    // ⅘
  "\u2159": 0.167,  // ⅙
  "\u215A": 0.833,  // ⅚
  "\u215B": 0.125,  // ⅛
  "\u215C": 0.375,  // ⅜
  "\u215D": 0.625,  // ⅝
  "\u215E": 0.875,  // ⅞
};

// ---------------------------------------------------------------------------
// Known units (lowercase) for ingredient parsing
// ---------------------------------------------------------------------------

const KNOWN_UNITS = new Set([
  "cup", "cups", "c",
  "tbsp", "tablespoon", "tablespoons", "tbs",
  "tsp", "teaspoon", "teaspoons",
  "oz", "ounce", "ounces",
  "lb", "lbs", "pound", "pounds",
  "g", "gram", "grams",
  "kg", "kilogram", "kilograms",
  "ml", "milliliter", "milliliters",
  "l", "liter", "liters",
  "pinch", "dash",
  "clove", "cloves",
  "can", "cans",
  "bunch", "bunches",
  "slice", "slices",
  "piece", "pieces",
  "package", "pkg",
  "stick", "sticks",
  "head", "heads",
  "sprig", "sprigs",
  "handful",
  "small", "medium", "large", "whole",
  "quart", "quarts", "qt",
  "pint", "pints", "pt",
  "gallon", "gallons", "gal",
]);

// ---------------------------------------------------------------------------
// ISO 8601 Duration Parser  (PT30M -> 30, PT1H30M -> 90, PT2H -> 120)
// ---------------------------------------------------------------------------

function parseDuration(iso: string | undefined | null): number | undefined {
  if (!iso || typeof iso !== "string") return undefined;
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return undefined;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  const total = hours * 60 + minutes + Math.ceil(seconds / 60);
  return total > 0 ? total : undefined;
}

// ---------------------------------------------------------------------------
// Parse a numeric quantity from the start of a string
// Handles: 2, 2.5, 1/2, 1 1/2, ½, 1½, etc.
// ---------------------------------------------------------------------------

function parseQuantity(raw: string): { value: number | undefined; rest: string } {
  let s = raw.trim();

  // Try: whole number + unicode fraction (e.g. "1½")
  const unicodeMixed = s.match(/^(\d+)\s*([^\d\s/.])/);
  if (unicodeMixed) {
    const frac = UNICODE_FRACTIONS[unicodeMixed[2]];
    if (frac !== undefined) {
      const whole = parseInt(unicodeMixed[1], 10);
      return { value: whole + frac, rest: s.slice(unicodeMixed[0].length).trim() };
    }
  }

  // Try: standalone unicode fraction (e.g. "½")
  const firstChar = s.charAt(0);
  if (UNICODE_FRACTIONS[firstChar] !== undefined) {
    return { value: UNICODE_FRACTIONS[firstChar], rest: s.slice(1).trim() };
  }

  // Try: mixed number with slash fraction "1 1/2"
  const mixedMatch = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den !== 0) {
      return { value: whole + num / den, rest: s.slice(mixedMatch[0].length).trim() };
    }
  }

  // Try: simple fraction "1/2"
  const fracMatch = s.match(/^(\d+)\s*\/\s*(\d+)/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) {
      return { value: num / den, rest: s.slice(fracMatch[0].length).trim() };
    }
  }

  // Try: decimal or whole number
  const numMatch = s.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) {
    return { value: parseFloat(numMatch[1]), rest: s.slice(numMatch[0].length).trim() };
  }

  return { value: undefined, rest: s };
}

// ---------------------------------------------------------------------------
// Ingredient string parser
// "2 cups all-purpose flour (sifted)" -> { quantity: 2, unit: "cups", name: "all-purpose flour", notes: "sifted" }
// ---------------------------------------------------------------------------

function parseIngredientString(raw: string): ParsedRecipe["ingredients"][number] {
  const trimmed = raw.trim();
  if (!trimmed) return { name: raw };

  // Extract parenthetical notes
  let notes: string | undefined;
  let working = trimmed;
  const parenMatch = working.match(/\(([^)]+)\)\s*$/);
  if (parenMatch) {
    notes = parenMatch[1].trim();
    working = working.slice(0, working.length - parenMatch[0].length).trim();
  }

  // Parse quantity
  const { value: quantity, rest: afterQty } = parseQuantity(working);

  if (!afterQty) {
    return { quantity, name: trimmed, notes };
  }

  // Parse unit
  const words = afterQty.split(/\s+/);
  const firstWord = words[0]?.toLowerCase().replace(/[.,]$/, "");
  let unit: string | undefined;
  let name: string;

  if (firstWord && KNOWN_UNITS.has(firstWord)) {
    unit = words[0].replace(/[.,]$/, "");
    name = words.slice(1).join(" ");
  } else {
    name = afterQty;
  }

  // If name ended up empty, use the original string
  if (!name.trim()) {
    name = trimmed;
    return { name, notes };
  }

  return {
    ...(quantity !== undefined && { quantity }),
    ...(unit !== undefined && { unit }),
    name: name.trim(),
    ...(notes !== undefined && { notes }),
  };
}

// ---------------------------------------------------------------------------
// Image extractor  (string | string[] | ImageObject | ImageObject[])
// ---------------------------------------------------------------------------

function extractImageUrl(image: unknown): string | undefined {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return extractImageUrl(image[0]);
  if (typeof image === "object" && image !== null) {
    const obj = image as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.contentUrl === "string") return obj.contentUrl;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Nutrition parser
// ---------------------------------------------------------------------------

function parseNutritionValue(val: unknown): number | undefined {
  if (val === undefined || val === null) return undefined;
  const s = String(val).replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}

function parseNutrition(
  nutrition: Record<string, unknown> | undefined | null,
): ParsedRecipe["nutrition"] | undefined {
  if (!nutrition || typeof nutrition !== "object") return undefined;

  const result: NonNullable<ParsedRecipe["nutrition"]> = {};
  const cal = parseNutritionValue(nutrition.calories);
  const protein = parseNutritionValue(nutrition.proteinContent);
  const carbs = parseNutritionValue(nutrition.carbohydrateContent);
  const fat = parseNutritionValue(nutrition.fatContent);
  const fiber = parseNutritionValue(nutrition.fiberContent);
  const sugar = parseNutritionValue(nutrition.sugarContent);
  const sodium = parseNutritionValue(nutrition.sodiumContent);

  if (cal !== undefined) result.calories = cal;
  if (protein !== undefined) result.protein = protein;
  if (carbs !== undefined) result.carbs = carbs;
  if (fat !== undefined) result.fat = fat;
  if (fiber !== undefined) result.fiber = fiber;
  if (sugar !== undefined) result.sugar = sugar;
  if (sodium !== undefined) result.sodium = sodium;

  return Object.keys(result).length > 0 ? result : undefined;
}

// ---------------------------------------------------------------------------
// Servings parser (recipeYield can be number, string, or array)
// ---------------------------------------------------------------------------

function parseServings(val: unknown): number | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "number") return val > 0 ? val : undefined;
  if (Array.isArray(val)) return parseServings(val[0]);
  if (typeof val === "string") {
    const m = val.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : undefined;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Normalize to string array
// ---------------------------------------------------------------------------

function toStringArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  if (typeof val === "string") return [val];
  if (Array.isArray(val)) return val.map(String);
  return undefined;
}

// ---------------------------------------------------------------------------
// Instructions parser  (handles HowToStep objects, HowToSection, and strings)
// ---------------------------------------------------------------------------

function parseInstructions(
  instructions: unknown[] | undefined,
): ParsedRecipe["instructions"] {
  if (!instructions || !Array.isArray(instructions)) return [];

  const result: ParsedRecipe["instructions"] = [];

  for (const item of instructions) {
    if (typeof item === "string") {
      const text = item.trim();
      if (text) result.push({ text });
    } else if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;

      // HowToSection with nested steps
      if (obj["@type"] === "HowToSection" && Array.isArray(obj.itemListElement)) {
        const nested = parseInstructions(obj.itemListElement as unknown[]);
        result.push(...nested);
      }
      // HowToStep
      else if (typeof obj.text === "string" && obj.text.trim()) {
        result.push({ text: obj.text.trim() });
      }
      // Some sites use "name" instead of "text" for steps
      else if (typeof obj.name === "string" && obj.name.trim()) {
        result.push({ text: obj.name.trim() });
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Strategy 1: JSON-LD extraction
// ---------------------------------------------------------------------------

function findRecipeInJsonLd(data: unknown): SchemaRecipe | null {
  if (!data || typeof data !== "object") return null;

  // Direct Recipe object
  if (!Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    const type = obj["@type"];
    if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
      return obj as unknown as SchemaRecipe;
    }
    // @graph array
    if (Array.isArray(obj["@graph"])) {
      for (const item of obj["@graph"]) {
        const found = findRecipeInJsonLd(item);
        if (found) return found;
      }
    }
    return null;
  }

  // Array of items
  for (const item of data) {
    const found = findRecipeInJsonLd(item);
    if (found) return found;
  }

  return null;
}

function extractFromJsonLd($: cheerio.CheerioAPI): SchemaRecipe | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    const content = $(scripts[i]).html();
    if (!content) continue;
    try {
      const parsed = JSON.parse(content);
      const recipe = findRecipeInJsonLd(parsed);
      if (recipe) return recipe;
    } catch {
      // Malformed JSON-LD, skip
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Strategy 2: Microdata extraction
// ---------------------------------------------------------------------------

function extractFromMicrodata($: cheerio.CheerioAPI): SchemaRecipe | null {
  const recipeEl = $('[itemtype*="schema.org/Recipe"]');
  if (recipeEl.length === 0) return null;

  const getText = (prop: string): string | undefined => {
    const el = recipeEl.find(`[itemprop="${prop}"]`);
    if (el.length === 0) return undefined;
    return (
      el.attr("content") ||
      el.attr("datetime") ||
      el.text().trim() ||
      undefined
    );
  };

  const getAll = (prop: string): string[] => {
    const els = recipeEl.find(`[itemprop="${prop}"]`);
    const result: string[] = [];
    els.each((_, el) => {
      const text =
        $(el).attr("content") || $(el).text().trim();
      if (text) result.push(text);
    });
    return result;
  };

  const name = getText("name");
  if (!name) return null;

  const imageEl = recipeEl.find('[itemprop="image"]');
  const image =
    imageEl.attr("src") ||
    imageEl.attr("content") ||
    imageEl.attr("href") ||
    undefined;

  const recipe: SchemaRecipe = {
    name,
    description: getText("description"),
    image,
    prepTime: getText("prepTime"),
    cookTime: getText("cookTime"),
    totalTime: getText("totalTime"),
    recipeYield: getText("recipeYield"),
    recipeIngredient: getAll("recipeIngredient"),
    recipeInstructions: getAll("recipeInstructions").map((t) => t),
    recipeCategory: getText("recipeCategory"),
    recipeCuisine: getText("recipeCuisine"),
  };

  // Nutrition
  const nutritionEl = recipeEl.find('[itemprop="nutrition"]');
  if (nutritionEl.length > 0) {
    recipe.nutrition = {};
    const nutritionProps = [
      "calories",
      "proteinContent",
      "carbohydrateContent",
      "fatContent",
      "fiberContent",
      "sugarContent",
      "sodiumContent",
    ];
    for (const prop of nutritionProps) {
      const el = nutritionEl.find(`[itemprop="${prop}"]`);
      const val = el.attr("content") || el.text().trim();
      if (val) recipe.nutrition[prop] = val;
    }
  }

  return recipe;
}

// ---------------------------------------------------------------------------
// Strategy 3: HTML heuristics (last resort)
// ---------------------------------------------------------------------------

function extractFromHeuristics($: cheerio.CheerioAPI): SchemaRecipe | null {
  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim();

  if (!title) return null;

  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content");

  const image = $('meta[property="og:image"]').attr("content");

  return {
    name: title,
    description: description || undefined,
    image: image || undefined,
  };
}

// ---------------------------------------------------------------------------
// Map schema.org Recipe data to ParsedRecipe (RecipeFormData)
// ---------------------------------------------------------------------------

function mapSchemaToRecipe(
  schema: SchemaRecipe,
  sourceUrl?: string,
): ParsedRecipe {
  const title = schema.name?.trim();
  if (!title) {
    throw new Error("Recipe has no title");
  }

  const ingredients = (schema.recipeIngredient || []).map(parseIngredientString);
  const instructions = parseInstructions(schema.recipeInstructions);

  const recipe: ParsedRecipe = {
    title,
    ingredients: ingredients.length > 0 ? ingredients : [],
    instructions: instructions.length > 0 ? instructions : [],
  };

  if (schema.description) recipe.description = schema.description.trim();
  if (sourceUrl) recipe.sourceUrl = sourceUrl;

  const imageUrl = extractImageUrl(schema.image);
  if (imageUrl) recipe.imageUrl = imageUrl;

  const prepTime = parseDuration(schema.prepTime);
  if (prepTime !== undefined) recipe.prepTime = prepTime;

  const cookTime = parseDuration(schema.cookTime);
  if (cookTime !== undefined) recipe.cookTime = cookTime;

  const totalTime = parseDuration(schema.totalTime);
  if (totalTime !== undefined) recipe.totalTime = totalTime;

  const servings = parseServings(schema.recipeYield);
  if (servings !== undefined) recipe.servings = servings;

  const cuisine = schema.recipeCuisine;
  if (cuisine) {
    recipe.cuisine = Array.isArray(cuisine) ? cuisine.join(", ") : String(cuisine);
  }

  const categoryNames = toStringArray(schema.recipeCategory);
  if (categoryNames && categoryNames.length > 0) {
    recipe.categoryNames = categoryNames;
  }

  const nutrition = parseNutrition(schema.nutrition);
  if (nutrition) recipe.nutrition = nutrition;

  return recipe;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse recipe data from raw HTML string.
 * Tries JSON-LD, then Microdata, then HTML heuristics.
 */
export function parseRecipeFromHtml(
  html: string,
  sourceUrl?: string,
): ParsedRecipe {
  const $ = cheerio.load(html);

  // Strategy 1: JSON-LD (primary)
  const jsonLd = extractFromJsonLd($);
  if (jsonLd) {
    return mapSchemaToRecipe(jsonLd, sourceUrl);
  }

  // Strategy 2: Microdata (fallback)
  const microdata = extractFromMicrodata($);
  if (microdata) {
    return mapSchemaToRecipe(microdata, sourceUrl);
  }

  // Strategy 3: HTML heuristics (last resort)
  const heuristics = extractFromHeuristics($);
  if (heuristics) {
    return mapSchemaToRecipe(heuristics, sourceUrl);
  }

  throw new Error("Could not extract recipe data from the provided HTML");
}

/**
 * Fetch a URL and parse recipe data from the response HTML.
 */
export async function parseRecipeFromUrl(url: string): Promise<ParsedRecipe> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RecipeApp/1.0; +https://example.com)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  return parseRecipeFromHtml(html, url);
}
