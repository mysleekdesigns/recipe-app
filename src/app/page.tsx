import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccentHeading } from "@/components/common/accent-heading";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <AccentHeading
          text="Adventure of Delicacies"
          accentWord="Delicacies"
          as="h1"
          className="mb-4 text-4xl sm:text-5xl"
        />
        <p className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary">
          Your personal recipe companion for discovering, organizing, and cooking
          delicious meals. Plan your week, create shopping lists, and cook with
          confidence.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary-hover"
          >
            <Link href="/recipes">Explore Recipes</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full"
          >
            <Link href="/recipes/new">Add Your Recipe</Link>
          </Button>
        </div>
      </section>

      {/* Value Props */}
      <section className="mb-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-surface p-6 shadow-md">
            <h3 className="mb-2 text-xl font-bold text-text-primary">
              User-Centered
            </h3>
            <p className="text-text-secondary">
              Designed with you in mind. Simple, intuitive interface that makes
              cooking a joy.
            </p>
          </div>
          <div className="rounded-lg bg-surface p-6 shadow-md">
            <h3 className="mb-2 text-xl font-bold text-text-primary">
              Diverse Recipes
            </h3>
            <p className="text-text-secondary">
              From quick weeknight dinners to elaborate weekend feasts. Cuisines
              from around the world.
            </p>
          </div>
          <div className="rounded-lg bg-surface p-6 shadow-md">
            <h3 className="mb-2 text-xl font-bold text-text-primary">
              Smart Planning
            </h3>
            <p className="text-text-secondary">
              Plan your meals for the week and automatically generate shopping
              lists.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="text-center">
        <AccentHeading
          text="Get Started Today"
          accentWord="Started"
          as="h2"
          className="mb-8 text-3xl"
        />
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary-hover"
          >
            <Link href="/recipes/new">Add Recipe</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary-hover"
          >
            <Link href="/recipes/import">Import from URL</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary-hover"
          >
            <Link href="/meal-plan">Plan Meals</Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary hover:bg-primary-hover"
          >
            <Link href="/shopping">Shopping List</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
