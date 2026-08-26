import { redirect, notFound } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm, type PropertyRecord } from "../../property-form";
import { PropertyPhotos, type PhotoItem } from "../../property-photos";
import { PROPERTY_STATUS_LABELS, type PropertyStatus } from "@/lib/property-categories";
import { Breadcrumbs } from "@/components/breadcrumbs";

type PropertyPhoto = { path: string; uploadedAt: string };

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("properties").select("*").eq("id", id).maybeSingle<
    PropertyRecord & { submitted_by: string; status: PropertyStatus; photos: PropertyPhoto[] }
  >();

  if (!data) notFound();
  if (auth.role !== "admin" && data.submitted_by !== auth.userId) redirect("/admin/properties");

  const photos: PhotoItem[] = (data.photos ?? []).map((p) => ({
    path: p.path,
    url: supabase.storage.from("property-photos").getPublicUrl(p.path).data.publicUrl,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Properties", href: "/admin/properties" }, { label: data.title }]} />
      <div>
        <h1 className="font-heading text-2xl font-bold">{data.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm capitalize">
          {PROPERTY_STATUS_LABELS[data.status]}
        </p>
      </div>
      <PropertyPhotos propertyId={id} photos={photos} />
      <PropertyForm role={auth.role} property={data} />
    </div>
  );
}
