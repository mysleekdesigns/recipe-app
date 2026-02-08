import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccentHeading } from "@/components/common/accent-heading";

export default function RecipeNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <AccentHeading
        text="Recipe Not Found"
        accentWord="Not Found"
        as="h1"
        className="mb-4 text-3xl sm:text-4xl"
      />
      <p className="mb-8 max-w-md text-text-secondary">
        The recipe you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Button asChild className="rounded-full bg-primary hover:bg-primary-hover">
        <Link href="/recipes">Browse All Recipes</Link>
      </Button>
    </div>
  );
}
