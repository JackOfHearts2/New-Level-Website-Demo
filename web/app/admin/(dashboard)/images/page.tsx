import { getSiteContent } from "@/lib/site-content";
import { ImageForm } from "./image-form";

export default async function AdminImagesPage() {
  const content = await getSiteContent();
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
        <ImageForm imageKey="logo" label="Logo" currentUrl={content.images.logoUrl} />
        <ImageForm
          imageKey="hero-bg"
          label="Homepage background photo"
          currentUrl={content.images.heroBgUrl}
        />
      </div>
    </div>
  );
}
