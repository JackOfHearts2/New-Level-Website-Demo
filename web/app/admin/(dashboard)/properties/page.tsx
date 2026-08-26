import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { GlowCard } from "@/components/ui/glow-card";
import { PROPERTY_STATUS_LABELS, type PropertyStatus } from "@/lib/property-categories";
import { PropertyReviewActions } from "./property-review-actions";

type PropertyRow = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  status: PropertyStatus;
  price: number | null;
  price_period: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  submitted_by: string;
  review_note: string | null;
};

type ProfileRow = { id: string; email: string | null; full_name: string | null };

const STATUS_STYLES: Record<PropertyStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-900",
  changes_requested: "bg-amber-100 text-amber-900",
  approved: "bg-[#72D35B]/20 text-[#2f6b1f]",
  rejected: "bg-destructive/15 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

function formatPrice(price: number | null, period: string | null) {
  if (price == null) return null;
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    price
  );
  return period === "sale" ? amount : `${amount}/${period}`;
}

export default async function PropertiesListPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const isAdmin = auth.role === "admin";

  let query = supabase
    .from("properties")
    .select("id, title, category, subcategory, status, price, price_period, city, state, created_at, submitted_by, review_note")
    .order("created_at", { ascending: false });
  if (!isAdmin) query = query.eq("submitted_by", auth.userId);
  const { data } = await query.returns<PropertyRow[]>();

  const rows = data ?? [];

  const submitterIds = Array.from(new Set(rows.map((r) => r.submitted_by)));
  const { data: profileRows } = submitterIds.length
    ? await supabase.from("profiles").select("id, email, full_name").in("id", submitterIds).returns<ProfileRow[]>()
    : { data: [] as ProfileRow[] };
  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Properties</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAdmin
              ? "Every listing, at every stage — add a new one, or review what editors have submitted."
              : "Your own listings — save a draft, submit for review, or check where a submission stands."}
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          + New listing
        </Link>
      </div>

      {rows.length === 0 ? (
        <GlowCard className="p-8 text-center">
          <p className="text-muted-foreground text-sm">No listings yet.</p>
        </GlowCard>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const submitter = profileMap.get(row.submitted_by);
            const price = formatPrice(row.price, row.price_period);
            return (
              <GlowCard key={row.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-heading font-semibold">{row.title}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[row.status]}`}>
                        {PROPERTY_STATUS_LABELS[row.status]}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs capitalize">
                      {row.category} · {row.subcategory.replace("_", " ")}
                      {row.city && ` · ${row.city}${row.state ? `, ${row.state}` : ""}`}
                      {price && ` · ${price}`}
                    </p>
                    {isAdmin && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {submitter?.full_name || submitter?.email || "Unknown"}
                      </p>
                    )}
                    {row.review_note && (row.status === "changes_requested" || row.status === "rejected") && (
                      <p className="text-foreground mt-2 text-sm">
                        <span className="font-semibold">Reviewer note:</span> {row.review_note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    {(isAdmin || row.submitted_by === auth.userId) &&
                      row.status !== "approved" &&
                      row.status !== "withdrawn" && (
                        <Link
                          href={`/admin/properties/${row.id}/edit`}
                          className="text-primary font-heading text-sm font-semibold"
                        >
                          Edit
                        </Link>
                      )}
                    {row.status === "approved" && (
                      <Link
                        href={`/admin/properties/${row.id}/edit`}
                        className="text-primary font-heading text-sm font-semibold"
                      >
                        Edit
                      </Link>
                    )}
                    {isAdmin && row.status === "pending" && <PropertyReviewActions propertyId={row.id} />}
                  </div>
                </div>
              </GlowCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
