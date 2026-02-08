"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "date", label: "Date Added" },
  { value: "name", label: "Name A-Z" },
  { value: "cookTime", label: "Cook Time" },
  { value: "rating", label: "Rating" },
];

interface SortControlsProps {
  activeSort?: string;
}

export function SortControls({ activeSort = "date" }: SortControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "date") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`/recipes?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-secondary">Sort by:</span>
      <Select value={activeSort} onValueChange={handleSort}>
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
