import Link from "next/link";
import Image from "next/image";
import { listingHref } from "@/components/properties/listing-card";
import { propertyPhotoUrl, pickDailyFeatured, type PublicListing } from "@/lib/listing-format";

// Client ask (2026-08-27): the About page's "look inside" preview used to
// hardcode the flagship property's own static /photos/*.jpg files by
// name — the only way to feature a different listing was editing this
// page's source. Rotates through every approved listing that has real
// photos instead (the same live `properties` table + unified photo
// pipeline the Properties browsing pages already read from — the
// flagship's own row has 5 photos in there too, migrated 2026-08-26). See
// pickDailyFeatured (lib/listing-format.ts) for the day-based rotation
// itself. With only one listing today, this always lands on it — the
// pool just grows for free as listings get added, no code change needed.
export function AboutFeaturedPropertySection({ listings }: { listings: PublicListing[] }) {
  const featured = pickDailyFeatured(listings);
  if (!featured) return null;

  const photos = featured.photos.slice(0, 2);
  const href = listingHref(featured);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <Link href={href} className="group block">
        <div className={photos.length > 1 ? "grid gap-4 sm:grid-cols-2" : "mx-auto max-w-2xl"}>
          {photos.map((photo) => (
            <div
              key={photo.path}
              className="group border-border relative aspect-4/3 overflow-hidden rounded-2xl border shadow-sm transition-shadow duration-300 hover:shadow-lg"
            >
              <Image
                src={propertyPhotoUrl(photo.path)}
                alt={featured.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>
          ))}
        </div>
        <p className="text-foreground group-hover:text-primary mt-3 text-center text-sm">
          A look inside <span className="font-semibold">{featured.title}</span>, our featured New
          Level property.
        </p>
      </Link>
    </section>
  );
}
