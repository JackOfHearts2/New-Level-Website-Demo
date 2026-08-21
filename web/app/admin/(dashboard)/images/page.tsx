import { getRawSiteContent } from "@/lib/site-content";
import { ImageForm } from "./image-form";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Images</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a new photo to replace one below. It&apos;s resized
          automatically — no need to shrink it yourself first.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageForm imageKey="logo" label="Logo" currentUrl={logoUrl} />
        <ImageForm
          imageKey="hero-bg"
          label="Homepage background photo"
          currentUrl={heroBgUrl}
        />
      </div>
    </div>
  );
}
