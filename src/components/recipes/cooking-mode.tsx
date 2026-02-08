"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Lock,
  Unlock,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ServingsAdjuster } from "@/components/recipes/servings-adjuster";
import { TimerPanel } from "@/components/common/timer";
import type { RecipeWithRelations } from "@/types";

interface CookingModeProps {
  recipe: RecipeWithRelations;
}

export function CookingMode({ recipe }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ingredientsPanelOpen, setIngredientsPanelOpen] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [currentServings, setCurrentServings] = useState(
    recipe.servings ?? 4
  );

  const instructions = recipe.instructions;
  const totalSteps = instructions.length;
  const instruction = instructions[currentStep];
  const progress =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  const goToPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentStep((s) => Math.min(totalSteps - 1, s + 1));
  }, [totalSteps]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  // Wake Lock management
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    async function requestWakeLock() {
      if (!("wakeLock" in navigator)) return;
      try {
        wakeLock = await navigator.wakeLock.request("screen");
        setWakeLockActive(true);
        wakeLock.addEventListener("release", () => {
          setWakeLockActive(false);
        });
      } catch {
        setWakeLockActive(false);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, []);

  if (totalSteps === 0) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">No instructions available for this recipe.</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href={`/recipes/${recipe.slug}`}>Back to recipe</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-gray-900 text-white">
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-700">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Link href={`/recipes/${recipe.slug}`} aria-label="Exit cooking mode">
            <X className="size-6" />
          </Link>
        </Button>

        <h1 className="truncate px-4 text-center text-sm font-medium text-gray-300 sm:text-base">
          {recipe.title}
        </h1>

        <div className="flex items-center gap-2">
          <span
            className="text-gray-400"
            title={
              wakeLockActive
                ? "Screen will stay on"
                : "Screen lock not available"
            }
          >
            {wakeLockActive ? (
              <Lock className="size-4" />
            ) : (
              <Unlock className="size-4" />
            )}
          </span>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white hover:bg-gray-800"
            onClick={() => setIngredientsPanelOpen(true)}
          >
            <UtensilsCrossed className="size-4" />
            <span className="hidden sm:inline">Ingredients</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 sm:px-12 lg:px-24">
        <p className="mb-4 text-sm font-medium tracking-wide text-primary uppercase">
          Step {currentStep + 1} of {totalSteps}
        </p>

        <p className="max-w-3xl text-center text-2xl leading-relaxed font-light sm:text-3xl lg:text-4xl">
          {instruction.text}
        </p>
      </main>

      {/* Bottom navigation */}
      <footer className="flex items-center justify-between border-t border-gray-700 px-4 py-4 sm:px-6">
        <Button
          variant="ghost"
          size="lg"
          className="min-h-[44px] min-w-[44px] text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={goToPrev}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="size-5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Step dots */}
        <div className="flex gap-1.5 overflow-hidden">
          {instructions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`size-2.5 shrink-0 rounded-full transition-colors ${
                i === currentStep
                  ? "bg-primary"
                  : i < currentStep
                    ? "bg-gray-500"
                    : "bg-gray-700"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="lg"
          className="min-h-[44px] min-w-[44px] text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={goToNext}
          disabled={currentStep === totalSteps - 1}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="size-5" />
        </Button>
      </footer>

      {/* Timer panel - fixed bottom-right */}
      <div className="fixed bottom-20 right-4 z-40 sm:right-6">
        <TimerPanel />
      </div>

      {/* Ingredients side panel */}
      <Sheet open={ingredientsPanelOpen} onOpenChange={setIngredientsPanelOpen}>
        <SheetContent
          side="right"
          className="overflow-y-auto bg-gray-900 text-white border-gray-700"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Ingredients</SheetTitle>
            <SheetDescription className="text-gray-400">
              {recipe.title}
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-4">
            <ServingsAdjuster
              originalServings={recipe.servings}
              ingredients={recipe.ingredients}
              onServingsChange={setCurrentServings}
            />

            <ul className="mt-6 space-y-3">
              {recipe.ingredients.map((ri) => {
                const scale =
                  recipe.servings && recipe.servings > 0
                    ? currentServings / recipe.servings
                    : 1;
                const adjustedQty =
                  ri.quantity != null
                    ? Math.round(ri.quantity * scale * 100) / 100
                    : null;

                return (
                  <li key={ri.id} className="flex items-start gap-3">
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                    <span className="text-gray-200">
                      {adjustedQty != null && (
                        <span className="font-semibold">{adjustedQty}</span>
                      )}
                      {ri.unit && <span> {ri.unit}</span>}{" "}
                      <span className="text-primary font-medium">
                        {ri.ingredient.name}
                      </span>
                      {ri.notes && (
                        <span className="text-gray-400"> ({ri.notes})</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
