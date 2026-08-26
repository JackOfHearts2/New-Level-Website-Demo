"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { SiteContent, getSiteContent } from "@/lib/site-content";
import { buildContentFromFormData } from "@/lib/site-content-form";
import { resolveSiteImages } from "@/lib/site-content-images";
import { saveContent, type FormState } from "@/app/admin/(dashboard)/actions";
import { updateOwnContentRequest } from "@/app/admin/(dashboard)/approvals/actions";
import { SitePreview } from "@/components/site-preview";
import { GlowFieldset } from "@/components/admin/glow-fieldset";
import { SectionPreview } from "@/components/admin/section-preview";
import { ImageForm } from "@/components/admin/image-form";
import { HeroSection } from "@/components/ui/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { ServicesSection } from "@/components/sections/services-section";
import { EventCtaSection } from "@/components/sections/event-cta-section";
import { TeamSection } from "@/components/sections/team-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { SiteFooter } from "@/components/sections/site-footer";

// Grows to fit whatever's typed rather than clipping/scrolling a fixed
// 3-row box — client feedback (2026-08-26): editors write multi-sentence
// copy in these and need to see all of it while editing, not just a
// scrollable peephole. Runs on mount too (via the ref callback) so a long
// existing value already renders expanded, not just after the next keystroke.
function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

// Label reads bigger/bolder than the editable value beneath it — client
// feedback (2026-08-26): the two used to be the same size, making it hard
// to tell at a glance which text was the field name vs. the actual content.
function Field({
  label,
  name,
  defaultValue,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue: string;
  textarea?: boolean;
}) {
  const className =
    "border-border bg-background mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  return (
    <label className="block">
      <span className="font-heading text-base font-semibold">{label}</span>
      {textarea ? (
        <textarea
          ref={autoResize}
          name={name}
          defaultValue={defaultValue}
          rows={3}
          onInput={(e) => autoResize(e.currentTarget)}
          className={cn(className, "resize-none overflow-hidden")}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          type="text"
          className={className}
        />
      )}
    </label>
  );
}

const Fieldset = GlowFieldset;

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

type SectionPreviewState = { title: string; node: React.ReactNode } | null;

export function ContentForm({
  content,
  resolved,
  reviseRequestId,
}: {
  content: SiteContent;
  // Only present on the main /admin/content page — the narrower "revise a
  // single already-submitted content request" flow (approvals/[id]/revise)
  // has no coherent per-slot image story (images are always their own
  // separate request row), so it renders ContentForm without this and the
  // embedded image slots below just don't render.
  resolved?: Awaited<ReturnType<typeof getSiteContent>>;
  reviseRequestId?: string;
}) {
  const action = reviseRequestId ? updateOwnContentRequest.bind(null, reviseRequestId) : saveContent;
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewContent, setPreviewContent] = useState<SiteContent | null>(null);
  const [sectionPreview, setSectionPreview] = useState<SectionPreviewState>(null);

  function currentContent() {
    if (!formRef.current) return content;
    return buildContentFromFormData(content, new FormData(formRef.current));
  }

  function handlePreview() {
    setPreviewContent(currentContent());
  }

  // Client ask (2026-08-26): "save or cancel buttons" wherever they're
  // editing. Native form reset reverts every uncontrolled input/textarea to
  // its defaultValue; auto-resize needs a manual re-run after that since it
  // only fires on mount/input, not on a programmatic reset.
  function handleCancel() {
    if (!confirm("Discard your unsaved changes?")) return;
    formRef.current?.reset();
    formRef.current?.querySelectorAll("textarea").forEach((el) => autoResize(el as HTMLTextAreaElement));
  }

  // Scoped preview — just the one section being edited, not the whole
  // homepage, per the client's "that's redundant" note (2026-08-26).
  function handlePreviewSection(title: string, render: (c: SiteContent, images: ReturnType<typeof resolveSiteImages>) => React.ReactNode) {
    const c = currentContent();
    const images = resolveSiteImages(c.images);
    setSectionPreview({ title, node: render(c, images) });
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <Fieldset
        legend="Brand"
        onPreview={() =>
          handlePreviewSection("Brand", (c, images) => (
            <>
              <HeroSection logoUrl={images.logoUrl} logoUrlDark={images.logoUrlDark} heroBgUrl={images.heroBgUrl} />
              <AboutSection aboutShort={c.brand.aboutShort} trustStats={c.trustStats} />
            </>
          ))
        }
      >
        <Field
          label="Tagline"
          name="brand.tagline"
          defaultValue={content.brand.tagline}
        />
        <Field
          label="About blurb"
          name="brand.aboutShort"
          defaultValue={content.brand.aboutShort}
          textarea
        />
        {resolved && (
          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <ImageForm
              imageKey="logo"
              label="Logo"
              currentUrl={content.images.logo ? resolved.images.logoUrl : null}
              siteContent={resolved}
            />
            <ImageForm
              imageKey="hero-bg"
              label="Homepage background photo"
              currentUrl={content.images.heroBg ? resolved.images.heroBgUrl : null}
              siteContent={resolved}
            />
          </div>
        )}
      </Fieldset>

      <Fieldset
        legend="Event CTA"
        onPreview={() => handlePreviewSection("Event CTA", (c) => <EventCtaSection eventCta={c.eventCta} />)}
      >
        <Field
          label="Eyebrow"
          name="eventCta.eyebrow"
          defaultValue={content.eventCta.eyebrow}
        />
        <Field
          label="Heading"
          name="eventCta.heading"
          defaultValue={content.eventCta.heading}
        />
        <Field
          label="Subtext"
          name="eventCta.sub"
          defaultValue={content.eventCta.sub}
          textarea
        />
        <Field
          label="Button text"
          name="eventCta.cta"
          defaultValue={content.eventCta.cta}
        />
      </Fieldset>

      <Fieldset
        legend="Trust Stats"
        onPreview={() =>
          handlePreviewSection("Trust Stats", (c) => (
            <AboutSection aboutShort={c.brand.aboutShort} trustStats={c.trustStats} />
          ))
        }
      >
        {content.trustStats.map((stat, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <Field
              label={`Value ${i + 1}`}
              name={`trustStats.${i}.value`}
              defaultValue={stat.value}
            />
            <Field
              label={`Label ${i + 1}`}
              name={`trustStats.${i}.label`}
              defaultValue={stat.label}
            />
          </div>
        ))}
      </Fieldset>

      <Fieldset
        legend="Services"
        onPreview={() => handlePreviewSection("Services", (c) => <ServicesSection services={c.services} />)}
      >
        {content.services.map((service, i) => (
          <div key={service.id} className="space-y-2">
            <Field
              label={`Title ${i + 1}`}
              name={`services.${i}.t`}
              defaultValue={service.t}
            />
            <Field
              label={`Description ${i + 1}`}
              name={`services.${i}.d`}
              defaultValue={service.d}
              textarea
            />
          </div>
        ))}
      </Fieldset>

      <Fieldset
        legend="Testimonials"
        onPreview={() =>
          handlePreviewSection("Testimonials", (c) => <TestimonialsSection testimonials={c.testimonials} />)
        }
      >
        {content.testimonials.map((testimonial, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <Field
              label={`Name ${i + 1}`}
              name={`testimonials.${i}.name`}
              defaultValue={testimonial.name}
            />
            <Field
              label={`Role ${i + 1}`}
              name={`testimonials.${i}.role`}
              defaultValue={testimonial.role}
            />
            <div className="sm:col-span-2">
              <Field
                label={`Quote ${i + 1}`}
                name={`testimonials.${i}.text`}
                defaultValue={testimonial.text}
                textarea
              />
            </div>
            {resolved && (
              <div className="sm:col-span-2">
                <ImageForm
                  imageKey={`testimonial-${i}`}
                  label={`${testimonial.name}'s photo`}
                  currentUrl={resolved.testimonials[i]?.photo ?? null}
                  siteContent={resolved}
                />
              </div>
            )}
          </div>
        ))}
      </Fieldset>

      <Fieldset legend="Team" onPreview={() => handlePreviewSection("Team", (c) => <TeamSection team={c.team} />)}>
        {content.team.map((member, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-2">
            <Field
              label={`Name ${i + 1}`}
              name={`team.${i}.name`}
              defaultValue={member.name}
            />
            <Field
              label={`Role ${i + 1}`}
              name={`team.${i}.role`}
              defaultValue={member.role}
            />
            <div className="sm:col-span-2">
              <Field
                label={`Motto ${i + 1}`}
                name={`team.${i}.motto`}
                defaultValue={member.motto}
              />
            </div>
            {resolved && (
              <div className="sm:col-span-2">
                <ImageForm
                  imageKey={`team-${i}`}
                  label={`${member.name}'s photo`}
                  currentUrl={resolved.team[i]?.photo ?? null}
                  siteContent={resolved}
                />
              </div>
            )}
          </div>
        ))}
      </Fieldset>

      <Fieldset
        legend="Social links"
        onPreview={() =>
          handlePreviewSection("Social links", (c, images) => (
            <SiteFooter
              tagline={c.brand.tagline}
              socials={c.socials}
              logoUrl={images.logoUrl}
              logoUrlDark={images.logoUrlDark}
            />
          ))
        }
      >
        {content.socials.map((social, i) => (
          <Field
            key={social.name}
            label={social.name}
            name={`socials.${i}.href`}
            defaultValue={social.href}
          />
        ))}
      </Fieldset>

      {state?.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          {reviseRequestId ? "Resubmitted" : "Submitted"} for admin approval — it
          won&apos;t go live until it&apos;s reviewed. Check &quot;Approvals&quot; for
          the status.
        </p>
      )}
      {state?.ok && !state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          Saved: the live homepage now reflects these changes.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <SaveButton label={reviseRequestId ? "Resubmit for review" : "Save changes"} />
        <button
          type="button"
          onClick={handlePreview}
          className="font-heading border-border rounded-xl border px-6 py-2.5 text-sm font-semibold"
        >
          Preview whole page
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="font-heading text-muted-foreground hover:text-foreground rounded-xl px-6 py-2.5 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>

      {previewContent && (
        <SitePreview
          content={{ ...previewContent, images: resolveSiteImages(previewContent.images) }}
          onClose={() => setPreviewContent(null)}
        />
      )}

      {sectionPreview && (
        <SectionPreview title={sectionPreview.title} onClose={() => setSectionPreview(null)}>
          {sectionPreview.node}
        </SectionPreview>
      )}
    </form>
  );
}
