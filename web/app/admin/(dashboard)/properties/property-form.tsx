"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  PROPERTY_CATEGORIES,
  LISTING_STATUSES,
  PRICE_PERIODS,
  type PropertyCategory,
} from "@/lib/property-categories";
import { saveProperty, type PropertyFormState } from "./actions";

export type PropertyRecord = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  price_period: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;
  mls_number: string | null;
  listing_status: string;
  description: string | null;
  source_url: string | null;
};

const fieldClass =
  "border-border bg-background mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const labelClass = "font-heading text-sm font-semibold";

function SaveButton({ label, confirmMessage }: { label: string; confirmMessage?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="mode"
      value="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) e.preventDefault();
      }}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function DraftButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="mode"
      value="draft"
      disabled={pending}
      className="font-heading border-border rounded-xl border px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save as draft"}
    </button>
  );
}

/** One form for both creating and editing a listing — client ask
 *  (2026-08-26): "if they're adding a new listing, they click a plus and
 *  it already has the pre-defined format... the same format for all of
 *  them so that we keep it uniform." Same draft/submit split as Content &
 *  Media (an editor's submit queues for admin review; an admin's submit
 *  publishes immediately, with the same confirm-before-live guard). No
 *  photo upload yet — a separate, not-yet-built increment. */
export function PropertyForm({
  property,
  role,
}: {
  property?: PropertyRecord;
  role: "editor" | "admin";
}) {
  const router = useRouter();
  const action = saveProperty.bind(null, property?.id ?? null);
  const [state, formAction] = useActionState<PropertyFormState, FormData>(action, undefined);
  const [category, setCategory] = useState<PropertyCategory>(
    (property?.category as PropertyCategory) ?? "residential"
  );
  const isAdmin = role === "admin";

  // Fresh listing just created — move to its edit URL so a page refresh or
  // further edits target the right row instead of creating a duplicate.
  // Doesn't fire again once `property` is passed in (i.e. once we're
  // actually on that edit page) since the effect's own dependency array
  // re-checks that each time.
  useEffect(() => {
    if (state?.ok && state.propertyId && !property) {
      router.replace(`/admin/properties/${state.propertyId}/edit`);
    }
  }, [state, property, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Title</span>
          <input name="title" defaultValue={property?.title} required className={fieldClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Category</span>
          <select
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PropertyCategory)}
            className={fieldClass}
          >
            {Object.entries(PROPERTY_CATEGORIES).map(([id, c]) => (
              <option key={id} value={id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Type</span>
          <select name="subcategory" defaultValue={property?.subcategory} className={fieldClass}>
            {Object.entries(PROPERTY_CATEGORIES[category].subcategories).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelClass}>Address line 1</span>
          <input name="addressLine1" defaultValue={property?.address_line1 ?? ""} className={fieldClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Address line 2</span>
          <input name="addressLine2" defaultValue={property?.address_line2 ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>City</span>
          <input name="city" defaultValue={property?.city ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>State</span>
          <input name="state" defaultValue={property?.state ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>ZIP</span>
          <input name="zip" defaultValue={property?.zip ?? ""} className={fieldClass} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Price</span>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={property?.price ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Price period</span>
          <select name="pricePeriod" defaultValue={property?.price_period ?? "sale"} className={fieldClass}>
            {PRICE_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p === "sale" ? "For sale" : `Per ${p}`}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Beds</span>
          <input name="beds" type="number" step="0.5" defaultValue={property?.beds ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Baths</span>
          <input name="baths" type="number" step="0.5" defaultValue={property?.baths ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Square feet</span>
          <input name="sqft" type="number" defaultValue={property?.sqft ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Year built</span>
          <input name="yearBuilt" type="number" defaultValue={property?.year_built ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>MLS number</span>
          <input name="mlsNumber" defaultValue={property?.mls_number ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Listing status</span>
          <select name="listingStatus" defaultValue={property?.listing_status ?? "active"} className={fieldClass}>
            {LISTING_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea name="description" defaultValue={property?.description ?? ""} rows={5} className={fieldClass} />
      </label>

      <label className="block">
        <span className={labelClass}>
          Source link <span className="text-muted-foreground font-normal">(MLS, Airbnb, Realtor.com, etc.)</span>
        </span>
        <input name="sourceUrl" type="url" defaultValue={property?.source_url ?? ""} className={fieldClass} />
      </label>

      {!property && (
        <p className="text-muted-foreground text-xs">
          Save this listing first, then you&apos;ll be able to add photos to it.
        </p>
      )}

      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <DraftButton />
        <SaveButton
          label={isAdmin ? "Publish live" : "Submit for review"}
          confirmMessage={
            isAdmin ? "Publish this listing live now? Visitors will see it immediately." : undefined
          }
        />
      </div>
    </form>
  );
}
