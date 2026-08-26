import { redirect, notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm, type PropertyRecord } from "../../property-form";
import { PROPERTY_STATUS_LABELS, type PropertyStatus } from "@/lib/property-categories";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("*").eq("id", id).maybeSingle<
    PropertyRecord & { submitted_by: string; status: PropertyStatus }
  >();

  if (!data) notFound();
  if (auth.role !== "admin" && data.submitted_by !== auth.userId) redirect("/admin/properties");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">{data.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">
          {PROPERTY_STATUS_LABELS[data.status]}
        </p>
      </div>
      <PropertyForm role={auth.role} property={data} />
    </div>
  );
}
