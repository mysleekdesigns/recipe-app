import { AccentHeading } from "@/components/common/accent-heading";
import { RecipeImport } from "@/components/recipes/recipe-import";

export default function ImportRecipePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <AccentHeading
        text="Import Recipe"
        accentWord="Import"
        as="h1"
        className="mb-8 text-3xl"
      />
      <RecipeImport />
    </div>
  );
}
