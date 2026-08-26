"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type ActionResult } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}

export function ProfileForm({
  firstName,
  lastName,
  displayName,
  bio,
}: {
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
}) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    updateProfile,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-heading font-medium">First name</span>
          <input
            name="firstName"
            type="text"
            defaultValue={firstName}
            className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <label className="block text-sm">
          <span className="font-heading font-medium">Last name</span>
          <input
            name="lastName"
            type="text"
            defaultValue={lastName}
            className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-heading font-medium">Display name</span>
        <input
          name="displayName"
          type="text"
          defaultValue={displayName}
          placeholder="How your name shows up around the dashboard"
          className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      <label className="block text-sm">
        <span className="font-heading font-medium">Bio</span>
        <textarea
          name="bio"
          rows={3}
          defaultValue={bio}
          className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </label>
      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-[#2f6b1f]" role="status">
          Profile saved.
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
