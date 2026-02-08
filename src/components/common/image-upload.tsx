"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (path: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value?.startsWith("http") ? value : "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { path } = await res.json();
        onChange(path);
      }
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  }

  function handleClear() {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
          className={cn(mode === "upload" && "bg-primary hover:bg-primary-hover")}
        >
          <Upload className="mr-1 h-3 w-3" /> Upload
        </Button>
        <Button
          type="button"
          variant={mode === "url" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("url")}
          className={cn(mode === "url" && "bg-primary hover:bg-primary-hover")}
        >
          <LinkIcon className="mr-1 h-3 w-3" /> URL
        </Button>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            dragOver
              ? "border-primary bg-primary-light"
              : "border-app-border hover:border-primary"
          )}
        >
          <Upload className="mb-2 h-8 w-8 text-text-secondary" />
          <p className="text-sm text-text-secondary">
            {uploading ? "Uploading..." : "Drag and drop or click to upload"}
          </p>
          <p className="mt-1 text-xs text-text-secondary">Max 5MB, images only</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            className="bg-primary hover:bg-primary-hover"
          >
            Set
          </Button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <div className="relative h-32 w-48 overflow-hidden rounded-lg">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
