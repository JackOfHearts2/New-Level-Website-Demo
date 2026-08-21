import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { logout } from "./actions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-4">
          <nav className="flex items-center gap-5">
            <Link href="/admin" className="font-heading font-bold">
              New Level Admin
            </Link>
            <Link
              href="/admin/content"
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              Content
            </Link>
            <Link
              href="/admin/images"
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              Images
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              View live site ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
