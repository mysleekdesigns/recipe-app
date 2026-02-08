"use client";

import { type Control, useFormContext } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { RecipeFormData } from "@/lib/validations/recipe";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNITS = [
  "cups",
  "tbsp",
  "tsp",
  "oz",
  "g",
  "ml",
  "lb",
  "kg",
  "pieces",
  "cloves",
  "whole",
] as const;

interface SortableIngredientRowProps {
  id: string;
  index: number;
  control: Control<RecipeFormData>;
  remove: () => void;
}

export function SortableIngredientRow({
  id,
  index,
  control,
  remove,
}: SortableIngredientRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-md border bg-card p-3"
    >
      <button
        type="button"
        className="mt-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="grid flex-1 grid-cols-[80px_100px_1fr_1fr] gap-2">
        <FormField
          control={control}
          name={`ingredients.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Qty"
                  step="any"
                  min="0"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : parseFloat(val));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`ingredients.${index}.unit`}
          render={({ field }) => (
            <FormItem>
              <Select
                value={field.value ?? ""}
                onValueChange={(val) =>
                  field.onChange(val === "__none__" ? undefined : val)
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">--</SelectItem>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`ingredients.${index}.name`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Ingredient name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`ingredients.${index}.notes`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Notes (optional)"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="mt-1.5 text-muted-foreground hover:text-destructive"
        onClick={remove}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
