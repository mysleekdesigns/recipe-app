"use client";

import { type Control } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import type { RecipeFormData } from "@/lib/validations/recipe";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface SortableInstructionRowProps {
  id: string;
  index: number;
  control: Control<RecipeFormData>;
  remove: () => void;
}

export function SortableInstructionRow({
  id,
  index,
  control,
  remove,
}: SortableInstructionRowProps) {
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
      className="flex items-start gap-3 rounded-md border bg-card p-3"
    >
      <button
        type="button"
        className="mt-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {index + 1}
      </span>

      <FormField
        control={control}
        name={`instructions.${index}.text`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Textarea
                placeholder={`Step ${index + 1} instructions...`}
                className="min-h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
