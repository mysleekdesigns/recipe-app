"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { importRecipeFromUrl } from "@/actions/import-actions";
import { createRecipe } from "@/actions/recipe-actions";
import { RecipeForm } from "@/components/recipes/recipe-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecipeFormData } from "@/lib/validations/recipe";
import type { ParsedRecipe } from "@/lib/recipe-parser";

export function RecipeImport() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRecipe | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    try {
      const result = await importRecipeFromUrl(url.trim());
      if (result.success) {
        setParsedData(result.data);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(data: RecipeFormData) {
    const result = await createRecipe(data);
    if (result.success) {
      toast.success("Recipe imported successfully!");
      router.push(`/recipes/${result.recipe.slug}`);
    }
  }

  function handleBack() {
    setParsedData(null);
  }

  if (parsedData) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          Back to URL input
        </Button>
        <p className="text-sm text-muted-foreground">
          Review the imported recipe below. Edit any fields before saving.
        </p>
        <RecipeForm defaultValues={parsedData} onSubmit={handleSubmit} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from URL</CardTitle>
        <CardDescription>
          Paste a recipe URL and we will extract the recipe details automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleImport} className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/recipe..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !url.trim()}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            Import
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
