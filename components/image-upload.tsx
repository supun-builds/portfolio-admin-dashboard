"use client";

import { useRef, useState } from "react";
import { ImagePlus, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { uploadFile } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { ImageRef } from "@/lib/types";

const MAX = 5 * 1024 * 1024;

/** Single or multiple image uploader. Uploads immediately and reports {id,url} refs. */
export function ImageUpload({
  value, onChange, max = 1, shape = "rect", className, hint,
}: {
  value: ImageRef[]; onChange: (v: ImageRef[]) => void; max?: number;
  shape?: "rect" | "circle" | "square"; className?: string; hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    let next = [...value];
    for (const file of Array.from(files)) {
      if (next.length >= max) { toast.error(`You can add up to ${max} image${max > 1 ? "s" : ""}`); break; }
      if (file.size > MAX) { toast.error(`${file.name} is over 5 MB`); continue; }
      try {
        const up = await uploadFile(file, "image");
        next = [...next, { id: up.id, url: up.url }];
        onChange(next);
      } catch { /* toast by interceptor */ }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  const radius = shape === "circle" ? "rounded-full" : "rounded-xl";
  const tile = shape === "rect" ? "aspect-video" : "aspect-square";

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("grid gap-3", shape === "rect" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-[repeat(auto-fill,7rem)]")}>
        {value.map((img, i) => (
          <div key={img.id} className={cn("group relative overflow-hidden ring-1 ring-border", radius, tile)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="size-full object-cover" />
            {max > 1 && i === 0 && (
              <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">
                <Star className="size-3 fill-amber-400 text-amber-400" /> Cover
              </span>
            )}
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((v) => v.id !== img.id))}
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => input.current?.click()} disabled={busy}
            className={cn("flex flex-col items-center justify-center gap-1.5 border border-dashed border-input text-xs text-muted-foreground transition hover:border-primary/60 hover:bg-primary/5 hover:text-foreground disabled:opacity-60", radius, tile)}>
            {busy ? <Spinner /> : <ImagePlus className="size-5" />}
            {busy ? "Uploading" : "Upload"}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input ref={input} type="file" hidden multiple={max > 1} accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={(e) => pick(e.target.files)} />
    </div>
  );
}
