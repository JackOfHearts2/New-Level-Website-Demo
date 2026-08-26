"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { SiteContent } from "@/lib/site-content";
import { saveImage, type FormState } from "@/app/admin/(dashboard)/actions";
import { updateOwnImageRequest } from "@/app/admin/(dashboard)/approvals/actions";
import { SitePreview } from "@/components/site-preview";

type ResolvedContent = Omit<SiteContent, "images"> & {
  images: { logoUrl: string; logoUrlDark: string; heroBgUrl: string };
};

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

// logo/hero-bg preview into images.*; team-<i>/testimonial-<i> preview
// directly onto that member's `photo` field, mirroring how
// getSiteContent() resolves real (saved) overrides the same way.
function withPreviewOverride(content: ResolvedContent, key: string, url: string): ResolvedContent {
  if (key === "logo") return { ...content, images: { ...content.images, logoUrl: url, logoUrlDark: url } };
  if (key === "hero-bg") return { ...content, images: { ...content.images, heroBgUrl: url } };
  const teamMatch = key.match(/^team-(\d+)$/);
  if (teamMatch) {
    const i = Number(teamMatch[1]);
    return { ...content, team: content.team.map((m, idx) => (idx === i ? { ...m, photo: url } : m)) };
  }
  const testimonialMatch = key.match(/^testimonial-(\d+)$/);
  if (testimonialMatch) {
    const i = Number(testimonialMatch[1]);
    return {
      ...content,
      testimonials: content.testimonials.map((t, idx) => (idx === i ? { ...t, photo: url } : t)),
    };
  }
  return content;
}

export function ImageForm({
  imageKey,
  label,
  currentUrl,
  siteContent,
  reviseRequestId,
}: {
  imageKey: string;
  label: string;
  currentUrl: string | null;
  siteContent: ResolvedContent;
  reviseRequestId?: string;
}) {
  const [state, setState] = useState<FormState>(undefined);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(currentUrl);
  const [showPreview, setShowPreview] = useState(false);
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
        // Show the picked file immediately, clearly labeled as not-yet-live
        // — always, for both admin and editor, rather than hiding it until
        // save succeeds. Hiding it was the actual gap behind "they preview
        // it, it doesn't work, they go back and change it."
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const objectUrl = URL.createObjectURL(resized);
        objectUrlRef.current = objectUrl;
        setPickedUrl(objectUrl);

        const formData = new FormData();
        formData.set("key", imageKey);
        formData.set("file", resized);
        const result = reviseRequestId
          ? await updateOwnImageRequest(reviseRequestId, formData)
          : await saveImage(undefined, formData);
        setState(result);
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.ok) {
          toast.success(
            result.pending ? `"${label}" submitted for admin approval` : `"${label}" uploaded — now live`
          );
        }
        if (result?.ok && !result?.pending) {
          setLivePreviewUrl(objectUrl);
        }
      } catch {
        setState({ error: "Couldn't process that image." });
        toast.error("Couldn't process that image.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  const previewSlotUrl = pickedUrl ?? livePreviewUrl;

  return (
    // min-w-0: this is a direct grid item wherever it's used two-up (Brand's
    // logo/hero-bg pair) — without it, the native <input type="file"> below
    // (which has a notoriously wide, non-shrinking intrinsic minimum width
    // for its "Choose File" button + placeholder text) forces this whole
    // card, and the grid it sits in, wider than the container. Client
    // report (2026-08-27): Testimonials/Team photo fields "extend past the
    // frame." Where ImageForm is nested one level deeper (Testimonials/
    // Team's per-member photo slot), the same min-w-0 is applied to that
    // wrapping sm:col-span-2 div in content-form.tsx instead, since that's
    // the actual grid item there — this one covers the direct-child case.
    <div className="border-border min-w-0 space-y-3 rounded-2xl border p-6">
      <h2 className="font-heading font-semibold">{label}</h2>
      {livePreviewUrl && (
        <div>
          <p className="text-muted-foreground text-xs font-medium">Current image</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview, may be a blob: object URL next/image can't optimize */}
          <img
            src={livePreviewUrl}
            alt={label}
            className="border-border bg-muted mt-1 h-24 w-auto rounded-lg border object-contain p-2"
          />
        </div>
      )}
      {pickedUrl && (
        <div>
          <p className="text-muted-foreground text-xs font-medium">Preview of your upload</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pickedUrl}
            alt={`${label} (not yet live)`}
            className="border-primary bg-muted mt-1 h-24 w-auto rounded-lg border-2 object-contain p-2"
          />
        </div>
      )}
      {!livePreviewUrl && !pickedUrl && (
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
          {reviseRequestId ? "Resubmitted" : "Submitted"} for admin approval — it
          won&apos;t go live until it&apos;s reviewed. Check &quot;Approvals&quot; for
          the status.
        </p>
      )}
      {state?.ok && !state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          Saved: the live homepage now reflects this change.
        </p>
      )}
      {previewSlotUrl && (
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="font-heading border-border rounded-xl border px-4 py-2 text-sm font-semibold"
        >
          Preview on page
        </button>
      )}

      {showPreview && previewSlotUrl && (
        <SitePreview
          content={withPreviewOverride(siteContent, imageKey, previewSlotUrl)}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
