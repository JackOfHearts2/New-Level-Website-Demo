"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X, Upload } from "lucide-react";
import { uploadPropertyPhoto, removePropertyPhoto, reorderPropertyPhoto } from "./actions";

export type PhotoItem = { path: string; url: string };

export function PropertyPhotos({ propertyId, photos }: { propertyId: string; photos: PhotoItem[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = await uploadPropertyPhoto(propertyId, fd);
      if (result.error) setError(result.error);
      else router.refresh();
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleRemove(path: string) {
    if (!confirm("Remove this photo?")) return;
    startTransition(async () => {
      const result = await removePropertyPhoto(propertyId, path);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  function handleReorder(path: string, direction: -1 | 1) {
    startTransition(async () => {
      const result = await reorderPropertyPhoto(propertyId, path, direction);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="border-border space-y-4 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold">
          Photos {photos.length > 0 && `(${photos.length})`}
        </h2>
        <label className="font-heading border-border hover:bg-muted flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold">
          <Upload className="size-3.5" />
          {pending ? "Uploading…" : "Add photo"}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={pending} className="hidden" />
        </label>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {photos.length === 0 ? (
        <p className="text-muted-foreground text-sm">No photos yet. The first one you add is shown first.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.path} className="group relative overflow-hidden rounded-xl">
              <div className="relative aspect-square">
                <Image src={photo.url} alt="" fill sizes="200px" className="object-cover" />
              </div>
              {i === 0 && (
                <span className="bg-primary text-primary-foreground absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1">
                <button
                  type="button"
                  onClick={() => handleReorder(photo.path, -1)}
                  disabled={i === 0 || pending}
                  aria-label="Move earlier"
                  className="flex size-6 items-center justify-center rounded text-white disabled:opacity-30"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(photo.path)}
                  disabled={pending}
                  aria-label="Remove photo"
                  className="flex size-6 items-center justify-center rounded text-white hover:text-red-300 disabled:opacity-30"
                >
                  <X className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(photo.path, 1)}
                  disabled={i === photos.length - 1 || pending}
                  aria-label="Move later"
                  className="flex size-6 items-center justify-center rounded text-white disabled:opacity-30"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
