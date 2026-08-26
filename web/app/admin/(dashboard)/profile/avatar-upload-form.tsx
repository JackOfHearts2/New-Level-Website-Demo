"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { saveAvatar, type ActionResult } from "../settings/actions";

/** Client ask (2026-08-26): "I also wanna see a picture. So I can
 *  identify that... it should be a requirement." Built as a strongly-
 *  encouraged nudge (the banner below) rather than a hard block on using
 *  the dashboard without one — actually locking editors/admins out until
 *  they upload a photo is a real policy call worth confirming (it would
 *  lock out the existing admin account today, which has no avatar yet)
 *  rather than something to silently enforce. */
export function AvatarUploadForm({
  displayName,
  currentUrl,
}: {
  displayName: string;
  currentUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [state, setState] = useState<ActionResult | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const initial = displayName.trim()[0]?.toUpperCase();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setState(undefined);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await saveAvatar(formData);
      setState(result);
      if (result?.error) setPreview(currentUrl);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex items-center gap-4">
      <div className="bg-primary/15 text-primary flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
        {preview ? (
          <Image src={preview} alt="Your photo" width={64} height={64} className="size-full object-cover" />
        ) : initial ? (
          <span className="font-heading text-xl font-bold">{initial}</span>
        ) : (
          <User className="size-6" />
        )}
      </div>
      <div>
        <label className="font-heading border-border inline-block cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted">
          {isPending ? "Uploading…" : currentUrl ? "Change photo" : "Upload photo"}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} disabled={isPending} className="hidden" />
        </label>
        {state?.error && (
          <p className="text-destructive mt-1 text-xs" role="alert">
            {state.error}
          </p>
        )}
        {!currentUrl && !preview && (
          <p className="text-muted-foreground mt-1 text-xs">
            No photo yet — helps everyone else tell who made a given change.
          </p>
        )}
      </div>
    </div>
  );
}
