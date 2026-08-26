import { ShinePill } from "@/components/ui/shine-shape";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { InlineEditable } from "@/components/edit-mode/inline-editable";
import { FormattedText } from "@/lib/formatted-text";

export function PageHero({
  eyebrow,
  heading,
  sub,
  intro,
  breadcrumbs,
  editKey,
}: {
  eyebrow: string;
  heading: string;
  sub?: string;
  intro?: string;
  /** Only worth passing on pages nested at least one level deep (a
   *  service/team/blog/property detail page) — see components/
   *  breadcrumbs.tsx. Top-level pages render this hero without it. */
  breadcrumbs?: Crumb[];
  /** SiteContent.pages key (e.g. "contact") for pages whose hero copy is
   *  admin-editable — wraps each field in InlineEditable so an admin can
   *  click the pencil right here on the live page instead of hunting for
   *  it in the dashboard. Only wraps fields that already have a value —
   *  a page whose `sub`/`intro` is unset today keeps rendering nothing
   *  there at all (same as before this existed), rather than an empty
   *  editable paragraph adding unwanted spacing for every visitor. Omit
   *  entirely for pages whose hero isn't wired into SiteContent.pages yet
   *  (dynamic per-item heroes, legal pages, etc.). */
  editKey?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-16 text-center sm:pt-40">
      {breadcrumbs && (
        <div className="mb-6 text-left">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
      <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
        {editKey ? <InlineEditable name={`pages.${editKey}.eyebrow`} value={eyebrow} /> : eyebrow}
      </ShinePill>
      <h1 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
        {editKey ? <InlineEditable name={`pages.${editKey}.heading`} value={heading} /> : heading}
      </h1>
      {sub &&
        (editKey ? (
          <InlineEditable
            name={`pages.${editKey}.sub`}
            value={sub}
            textarea
            tag="p"
            className="text-foreground mt-4 text-lg text-balance"
          />
        ) : (
          <p className="text-foreground mt-4 text-lg text-balance">{sub}</p>
        ))}
      {intro &&
        (editKey ? (
          <InlineEditable
            name={`pages.${editKey}.intro`}
            value={intro}
            textarea
            tag="p"
            className="text-foreground mx-auto mt-4 max-w-xl text-balance text-sm"
          />
        ) : (
          <p className="text-foreground mx-auto mt-4 max-w-xl text-balance text-sm">
            <FormattedText text={intro} />
          </p>
        ))}
    </div>
  );
}
