"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, UtensilsCrossed } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { searchRecipes } from "@/actions/search-actions";

type SearchResult = Awaited<ReturnType<typeof searchRecipes>>[number];

export function SearchBar() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const openSearch = () => setOpen(true);

    document.addEventListener("keydown", down);
    document.addEventListener("open-search", openSearch);
    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-search", openSearch);
    };
  }, []);

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(async () => {
      const data = await searchRecipes(query);
      setResults(data);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setQuery("");
      setResults([]);
    }
  };

  const handleSelectRecipe = (slug: string) => {
    setOpen(false);
    router.push(`/recipes/${slug}`);
  };

  const handleSearchAll = () => {
    if (!query) return;
    setOpen(false);
    router.push(`/recipes?q=${encodeURIComponent(query)}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder="Search recipes..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "Searching..." : "No recipes found."}
        </CommandEmpty>

        {results.length > 0 && (
          <CommandGroup heading="Recipes">
            {results.map((recipe) => (
              <CommandItem
                key={recipe.id}
                value={recipe.title}
                onSelect={() => handleSelectRecipe(recipe.slug)}
              >
                <UtensilsCrossed className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{recipe.title}</span>
                <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  {recipe.cuisine && <span>{recipe.cuisine}</span>}
                  {recipe.cookTime && (
                    <span className="flex items-center">
                      <Clock className="mr-0.5 h-3 w-3" />
                      {recipe.cookTime}m
                    </span>
                  )}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query.length >= 2 && (
          <>
            {results.length > 0 && <CommandSeparator />}
            <CommandGroup>
              <CommandItem onSelect={handleSearchAll}>
                <Search className="mr-2 h-4 w-4" />
                Search all recipes for &ldquo;{query}&rdquo;
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {query.length < 2 && (
          <CommandGroup heading="Suggestions">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push("/recipes?q=chicken");
              }}
            >
              Chicken recipes
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push("/recipes?q=pasta");
              }}
            >
              Pasta recipes
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setOpen(false);
                router.push("/recipes?q=vegetarian");
              }}
            >
              Vegetarian recipes
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function SearchTrigger() {
  return (
    <Button
      variant="outline"
      className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      onClick={() => document.dispatchEvent(new CustomEvent("open-search"))}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Search...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </Button>
  );
}
