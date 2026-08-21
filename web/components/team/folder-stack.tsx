import Image from "next/image";
import type { TEAM } from "@/lib/content";

// The closed-folder visual — a dark folder shape with a few team photos
// peeking out above it, stacked and fanned slightly. Shared between the
// homepage teaser (static) and the /team page (interactive, opens on
// click) so the closed-state look is identical in both places.
export function FolderStack({ team }: { team: typeof TEAM }) {
  const preview = team.slice(0, 3);
  return (
    <div className="relative mx-auto flex h-56 w-full max-w-sm items-end justify-center">
      <div className="absolute bottom-10 flex items-end justify-center">
        {preview.map((member, i) => {
          const offset = i - 1;
          return (
            <div
              key={member.name + i}
              className="border-border relative -mx-4 h-32 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-white shadow-xl"
              style={{
                transform: `translateY(${Math.abs(offset) * 10}px) rotate(${offset * 8}deg)`,
                zIndex: 10 - Math.abs(offset),
              }}
            >
              <Image src={member.photo} alt="" fill sizes="96px" className="object-cover" />
            </div>
          );
        })}
      </div>
      <div className="relative z-20 w-72">
        {/* Tab anchored to the body's own top-left corner via a negative
            top offset, rather than independent top-N positioning on a
            sibling — guarantees the two always touch regardless of size. */}
        <div className="border-border relative h-16 rounded-b-xl rounded-tr-xl border bg-gradient-to-b from-[#1e1e1e] to-[#0a0a0a] shadow-[inset_0_0_30px_rgba(0,0,0,0.7)]">
          <div className="absolute -top-6 left-0 h-6 w-28 rounded-t-xl border border-b-0 border-white/10 bg-gradient-to-t from-[#1e1e1e] to-[#2a2a2a]" />
        </div>
      </div>
    </div>
  );
}
