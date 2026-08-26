import { redirect } from "next/navigation";

// Images and Content were unified into one page (2026-08-26) — see
// project_admin_dashboard_redesign_2026_08_26 memory. This route stays as
// a redirect rather than being deleted outright in case anything still
// links here (bookmarks, the revise flow's history, etc.).
export default function AdminImagesRedirect() {
  redirect("/admin/content");
}
