"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { grantAccess, revokeAccess, type ActionResult } from "./actions";

function GrantButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading rounded-lg bg-[#72D35B] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
    >
      {pending ? "Granting…" : "Grant access"}
    </button>
  );
}

export function GrantEditorForm() {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    grantAccess,
    undefined
  );

  return (
    <form action={formAction} className="border-border space-y-3 rounded-2xl border p-6">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="block text-sm">
          <span className="font-heading font-medium">Email of an existing account</span>
          <input
            name="email"
            type="email"
            required
            placeholder="someone@example.com"
            className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <label className="block text-sm">
          <span className="font-heading font-medium">Access tier</span>
          <select
            name="role"
            defaultValue="editor"
            className="border-border mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="viewer">Viewer (placeholder — no access yet)</option>
            <option value="editor">Editor</option>
            <option value="manager">Manager (placeholder — no access yet)</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      </div>
      <p className="text-muted-foreground text-xs">
        They need to have already signed up on the public site. Editors submit content/photo
        changes for admin review; admins can edit and approve directly. Viewer and Manager are
        reserved tiers for later — granting them today gives no dashboard access.
      </p>
      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-[#2f6b1f]" role="status">
          Access granted.
        </p>
      )}
      <GrantButton />
    </form>
  );
}

export function RevokeButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await revokeAccess(userId);
      if (!result.error) router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className="text-destructive font-heading text-sm font-semibold disabled:opacity-50"
    >
      {isPending ? "Revoking…" : "Revoke"}
    </button>
  );
}
