import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TEAM } from "@/lib/content";
import { InlineEditable } from "@/components/edit-mode/inline-editable";

// Ported from the client's tailwind-image-accordion reference: a row of
// images that are all equal width at rest, and on hover/focus the
// hovered one expands (CSS group-hover, no JS state) revealing name/role
// text overlaid at the bottom, while the others shrink to make room.
// Each tile links straight to that person's own bio page at /team/[slug]
// — clicking a photo here (not just "Meet the full team") goes directly
// to their profile.
//
// The outer element used to be the Link itself. Converted to a plain div
// (keeping every class — group/article, the hover/focus reveal, before:
// gradient — none of that cares whether its host is a div or an anchor)
// with a separate stretched Link (absolute inset-0, z-0) as the click
// target instead, so name/role can be wrapped in InlineEditable without
// nesting its pencil <button> inside an <a> — same stretched-link pattern
// already used for the homepage Services cards. :focus-within still
// triggers correctly since it matches on descendants, not just self.
export function TeamImageAccordion({ team }: Readonly<{ team: typeof TEAM }>) {
  return (
    <div className="group mx-auto mb-10 mt-3 flex w-full max-md:flex-col justify-center gap-2">
      {team.map((member, i) => (
        <div
          key={member.name + i}
          className="group/article relative w-full overflow-hidden rounded-xl transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.15)] before:absolute before:inset-x-0 before:bottom-0 before:h-1/3 before:bg-gradient-to-t before:from-black/50 before:transition-opacity md:before:opacity-0 md:hover:before:opacity-100 focus-within:before:opacity-100 md:not-[&:hover]:group-hover:w-[20%] md:[&:not(:focus-within):not(:hover)]:group-focus-within:w-[20%]"
        >
          <Link href={`/team/${member.slug}`} className="absolute inset-0 z-0" aria-label={member.name} />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-3 text-white">
            <h3 className="text-xl font-medium md:truncate md:whitespace-nowrap md:translate-y-2 md:opacity-0 transition duration-200 ease-[cubic-bezier(.5,.85,.25,1.8)] group-hover/article:translate-y-0 group-hover/article:opacity-100 group-hover/article:delay-300 group-focus-within/article:translate-y-0 group-focus-within/article:opacity-100 group-focus-within/article:delay-300">
              <InlineEditable name={`team.${i}.name`} value={member.name} />
            </h3>
            <span className="text-2xl font-medium md:truncate md:whitespace-nowrap md:translate-y-2 md:opacity-0 transition duration-200 ease-[cubic-bezier(.5,.85,.25,1.8)] group-hover/article:translate-y-0 group-hover/article:opacity-100 group-hover/article:delay-500 group-focus-within/article:translate-y-0 group-focus-within/article:opacity-100 group-focus-within/article:delay-500">
              <InlineEditable name={`team.${i}.role`} value={member.role} />
            </span>
          </div>
          <Image
            src={member.photo}
            alt={member.name}
            width={480}
            height={640}
            className={cn(
              "h-72 w-full object-cover md:h-[420px]",
              member.photoPosition === "top" && "object-top"
            )}
          />
        </div>
      ))}
    </div>
  );
}
