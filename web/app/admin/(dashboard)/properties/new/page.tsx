import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { PropertyForm } from "../property-form";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function NewPropertyPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Properties", href: "/admin/properties" }, { label: "New listing" }]} />
      <div>
        <h1 className="font-heading text-2xl font-bold">New listing</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Same format every time, so listings stay consistent.
        </p>
      </div>
      <PropertyForm role={auth.role} />
    </div>
  );
}
