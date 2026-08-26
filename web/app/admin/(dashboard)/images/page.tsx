import { getRawSiteContent, getSiteContent } from "@/lib/site-content";
import { ImageForm } from "@/components/admin/image-form";

export default async function AdminImagesPage() {
  // Deliberately the raw (unresolved) content here, not getSiteContent()'s
  // public-facing view — that view fills in real defaults (the built-in
  // logo, a property photo behind the hero) when nothing's been uploaded,
  // which would make every slot look "already set" on this page even when
  // no admin override actually exists yet.
  const raw = await getRawSiteContent();
  const logoUrl = raw.images.logo
    ? `/api/site-image/logo?v=${raw.images.logo.updatedAt}`
    : null;
  const heroBgUrl = raw.images.heroBg
    ? `/api/site-image/hero-bg?v=${raw.images.heroBg.updatedAt}`
    : null;

  // The fully-resolved live content (real defaults filled in) — needed so
  // the "Preview on page" button can render the whole page correctly with
  // just the one changed slot swapped in.
  const siteContent = await getSiteContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Images</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a new photo to replace one below. It&apos;s resized
          automatically, no need to shrink it yourself first.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageForm imageKey="logo" label="Logo" currentUrl={logoUrl} siteContent={siteContent} />
        <ImageForm
          imageKey="hero-bg"
          label="Homepage background photo"
          currentUrl={heroBgUrl}
          siteContent={siteContent}
        />
      </div>
    </div>
  );
}
