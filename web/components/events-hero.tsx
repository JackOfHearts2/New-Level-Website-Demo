import Image from "next/image";
import { ShinePill } from "@/components/ui/shine-shape";

// Stock placeholder photo (client-authorized for this demo — see
// feedback_stock_photos_ok_for_demo memory) standing in for real event
// photography the client will provide later: "a hero layout for that page
// as well with our future images in the background behind the words
// Events and Networking." Unlike the homepage's HeroSection, this page's
// SiteHeader is already solid/opaque (no hero to be transparent over on
// secondary pages), so this is a plain image band under the nav rather
// than something coordinating nav transparency.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2000&h=900&fit=crop&auto=format";

export function EventsHero({
  eyebrow,
  heading,
  sub,
}: {
  eyebrow: string;
  heading: string;
  sub?: string;
}) {
  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden px-6 py-32">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <ShinePill className="bg-white/15 font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
          {eyebrow}
        </ShinePill>
        <h1 className="font-heading mt-6 text-4xl font-bold text-balance text-white md:text-5xl">
          {heading}
        </h1>
        {sub && <p className="mt-4 text-lg text-balance text-white/90">{sub}</p>}
      </div>
    </div>
  );
}
