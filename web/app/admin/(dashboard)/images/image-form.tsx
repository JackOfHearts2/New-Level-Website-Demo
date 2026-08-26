"use client";

import { useRef, useState, useTransition } from "react";
import { saveImage, type FormState } from "../actions";

async function resizeImage(file: File, maxEdge = 1600, quality = 0.8): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  // Keep PNG output for PNG sources — logos commonly rely on a transparent
  // background, and re-encoding as JPEG would flatten that to solid black.
  const keepPng = file.type === "image/png";
  const outType = keepPng ? "image/png" : "image/jpeg";
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, outType, keepPng ? undefined : quality)
  );
  if (!blob) return file;
  const ext = keepPng ? ".png" : ".jpg";
  return new File([blob], file.name.replace(/\.\w+$/, "") + ext, {
    type: outType,
  });
}

export function ImageForm({
  imageKey,
  label,
  currentUrl,
}: {
  imageKey: "logo" | "hero-bg";
  label: string;
  currentUrl: string | null;
}) {
  const [state, setState] = useState<FormState>(undefined);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setState(undefined);

    startTransition(async () => {
      try {
        const resized = await resizeImage(file);
        const formData = new FormData();
        formData.set("key", imageKey);
        formData.set("file", resized);
        const result = await saveImage(undefined, formData);
        setState(result);
        if (result?.ok && !result?.pending) {
          // Revoke the previous blob: preview before replacing it — each
          // upload otherwise leaks the last one for the page's lifetime.
          // Only swap the preview when the change actually went live —
          // an editor's pending upload hasn't, so showing it here would
          // misleadingly suggest it already had.
          if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
          const url = URL.createObjectURL(resized);
          objectUrlRef.current = url;
          setPreview(url);
        }
      } catch {
        setState({ error: "Couldn't process that image." });
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="border-border space-y-3 rounded-2xl border p-6">
      <h2 className="font-heading font-semibold">{label}</h2>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin-only preview, may be a blob: object URL next/image can't optimize
        <img
          src={preview}
          alt={label}
          className="border-border bg-muted h-24 w-auto rounded-lg border object-contain p-2"
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          No custom photo uploaded, the live site is showing a built-in default.
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={isPending}
        className="text-sm"
      />
      {isPending && <p className="text-muted-foreground text-sm">Uploading…</p>}
      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          Submitted for admin approval — it won&apos;t go live until it&apos;s
          reviewed. Check &quot;Approvals&quot; for the status.
        </p>
      )}
      {state?.ok && !state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          Saved: the live homepage now reflects this change.
        </p>
      )}
    </div>
  );
}
