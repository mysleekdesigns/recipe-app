"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Loader2, Check, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";

import { recipeSchema, type RecipeFormData } from "@/lib/validations/recipe";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { SortableIngredientRow } from "./ingredient-input";
import { SortableInstructionRow } from "./instruction-input";

interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isEditing?: boolean;
}

export function RecipeForm({
  defaultValues,
  onSubmit,
  isEditing = false,
}: RecipeFormProps) {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      ingredients: [{ name: "" }],
      instructions: [{ text: "" }],
      categoryNames: [],
      tagNames: [],
      ...defaultValues,
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const {
    fields: ingredientFields,
    append: ingredientAppend,
    remove: ingredientRemove,
    move: ingredientMove,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: instructionFields,
    append: instructionAppend,
    remove: instructionRemove,
    move: instructionMove,
  } = useFieldArray({ control, name: "instructions" });

  // Auto-calculate totalTime
  const prepTime = watch("prepTime");
  const cookTime = watch("cookTime");

  useEffect(() => {
    const prep = prepTime ?? 0;
    const cook = cookTime ?? 0;
    const total = prep + cook;
    setValue("totalTime", total || undefined);
  }, [prepTime, cookTime, setValue]);

  // Drag handlers
  function handleIngredientDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = ingredientFields.findIndex((f) => f.id === active.id);
      const newIndex = ingredientFields.findIndex((f) => f.id === over.id);
      ingredientMove(oldIndex, newIndex);
    }
  }

  function handleInstructionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = instructionFields.findIndex((f) => f.id === active.id);
      const newIndex = instructionFields.findIndex((f) => f.id === over.id);
      instructionMove(oldIndex, newIndex);
    }
  }

  // Submit handler
  async function onFormSubmit(data: RecipeFormData) {
    try {
      await onSubmit(data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="times">Times & Servings</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="categories">Categories & Tags</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Recipe title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe this recipe..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="cuisine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Italian, Mexican"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(val) =>
                        field.onChange(
                          val === "__none__" ? undefined : val
                        )
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">--</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://... (image URL)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Tab 2: Times & Servings */}
          <TabsContent value="times" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="prepTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prep Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? undefined : parseInt(val, 10)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="cookTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cook Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? undefined : parseInt(val, 10)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="totalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Time (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled
                        placeholder="Auto-calculated"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="servings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servings</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="4"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val === "" ? undefined : parseInt(val, 10)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          {/* Tab 3: Ingredients */}
          <TabsContent value="ingredients" className="space-y-4 pt-4">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleIngredientDragEnd}
            >
              <SortableContext
                items={ingredientFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {ingredientFields.map((field, index) => (
                    <SortableIngredientRow
                      key={field.id}
                      id={field.id}
                      index={index}
                      control={control}
                      remove={() => ingredientRemove(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ingredientAppend({ name: "" })}
            >
              <Plus className="size-4" />
              Add Ingredient
            </Button>
          </TabsContent>

          {/* Tab 4: Instructions */}
          <TabsContent value="instructions" className="space-y-4 pt-4">
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleInstructionDragEnd}
            >
              <SortableContext
                items={instructionFields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {instructionFields.map((field, index) => (
                    <SortableInstructionRow
                      key={field.id}
                      id={field.id}
                      index={index}
                      control={control}
                      remove={() => instructionRemove(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => instructionAppend({ text: "" })}
            >
              <Plus className="size-4" />
              Add Step
            </Button>
          </TabsContent>

          {/* Tab 5: Categories & Tags */}
          <TabsContent value="categories" className="space-y-6 pt-4">
            <MultiSelectField
              control={control}
              name="categoryNames"
              label="Categories"
              placeholder="Search or add categories..."
            />
            <MultiSelectField
              control={control}
              name="tagNames"
              label="Tags"
              placeholder="Search or add tags..."
            />
          </TabsContent>

          {/* Tab 6: Nutrition */}
          <TabsContent value="nutrition" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              All nutrition fields are optional.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <NutritionField control={control} name="nutrition.calories" label="Calories" />
              <NutritionField control={control} name="nutrition.protein" label="Protein (g)" />
              <NutritionField control={control} name="nutrition.carbs" label="Carbs (g)" />
              <NutritionField control={control} name="nutrition.fat" label="Fat (g)" />
              <NutritionField control={control} name="nutrition.fiber" label="Fiber (g)" />
              <NutritionField control={control} name="nutrition.sugar" label="Sugar (g)" />
              <NutritionField control={control} name="nutrition.sodium" label="Sodium (mg)" />
            </div>
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isEditing ? "Update Recipe" : "Create Recipe"}
        </Button>
      </form>
    </Form>
  );
}

// --- Internal helper components ---

function NutritionField({
  control,
  name,
  label,
}: {
  control: Control<RecipeFormData>;
  name:
    | "nutrition.calories"
    | "nutrition.protein"
    | "nutrition.carbs"
    | "nutrition.fat"
    | "nutrition.fiber"
    | "nutrition.sugar"
    | "nutrition.sodium";
  label: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="0"
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
  );
}

function MultiSelectField({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<RecipeFormData>;
  name: "categoryNames" | "tagNames";
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: string[] = field.value ?? [];

        function addItem(value: string) {
          const trimmed = value.trim();
          if (trimmed && !selected.includes(trimmed)) {
            field.onChange([...selected, trimmed]);
          }
          setInputValue("");
        }

        function removeItem(value: string) {
          field.onChange(selected.filter((item) => item !== value));
        }

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-auto min-h-9 w-full justify-between font-normal"
                  >
                    {selected.length > 0
                      ? `${selected.length} selected`
                      : placeholder}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput
                    placeholder={placeholder}
                    value={inputValue}
                    onValueChange={setInputValue}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inputValue.trim()) {
                        e.preventDefault();
                        addItem(inputValue);
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {inputValue.trim() ? (
                        <button
                          type="button"
                          className="w-full px-2 py-1.5 text-sm"
                          onClick={() => addItem(inputValue)}
                        >
                          Add &quot;{inputValue.trim()}&quot;
                        </button>
                      ) : (
                        "Type to add a new item."
                      )}
                    </CommandEmpty>
                    {selected.length > 0 && (
                      <CommandGroup heading="Selected">
                        {selected.map((item) => (
                          <CommandItem
                            key={item}
                            value={item}
                            onSelect={() => removeItem(item)}
                          >
                            <Check className="size-4" />
                            {item}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selected.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selected.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                    <button
                      type="button"
                      className="ml-1 rounded-full outline-none hover:text-destructive"
                      onClick={() => removeItem(item)}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
