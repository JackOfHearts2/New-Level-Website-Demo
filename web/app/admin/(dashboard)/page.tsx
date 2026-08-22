import Link from "next/link";

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Edit what visitors see on the homepage. Changes go live as soon as
          you save, no need to wait for anything else.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/content"
          className="border-border block rounded-2xl border p-6 shadow-sm transition-colors hover:bg-muted"
        >
          <h2 className="font-heading font-semibold">Edit Content</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            About text, services, team bios, testimonials, and more.
          </p>
        </Link>
        <Link
          href="/admin/images"
          className="border-border block rounded-2xl border p-6 shadow-sm transition-colors hover:bg-muted"
        >
          <h2 className="font-heading font-semibold">Edit Images</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Swap the logo and the homepage background photo.
          </p>
        </Link>
      </div>
    </div>
  );
}
