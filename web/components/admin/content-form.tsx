"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SiteContent, getSiteContent } from "@/lib/site-content";
import { buildContentFromFormData } from "@/lib/site-content-form";
import { resolveSiteImages } from "@/lib/site-content-images";
import {
  saveContent,
  saveContentDraft,
  saveContentSection,
  saveContentSectionDraft,
  type FormState,
  type DraftFormState,
} from "@/app/admin/(dashboard)/actions";
import { updateOwnContentRequest } from "@/app/admin/(dashboard)/approvals/actions";
import { SitePreview } from "@/components/site-preview";
import { GlowFieldset } from "@/components/admin/glow-fieldset";
import { SectionPreview } from "@/components/admin/section-preview";
import { ImageForm } from "@/components/admin/image-form";
import { RichTextToolbar } from "@/components/admin/rich-text-toolbar";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <label className="block">
      <span className="font-heading text-base font-semibold">{label}</span>
      {textarea ? (
        <>
          <div className="mt-1.5">
            <RichTextToolbar targetRef={textareaRef} />
          </div>
          <textarea
            ref={(el) => {
              textareaRef.current = el;
              autoResize(el);
            }}
            name={name}
            defaultValue={defaultValue}
            rows={3}
            onInput={(e) => autoResize(e.currentTarget)}
            className={cn(className, "mt-0 resize-none overflow-hidden")}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Select text and click a formatting button, or type **bold**, *italic*, __underline__.
          </p>
        </>
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

/** Per-section Save/Draft/Submit/Revert row (queue item 1 + 2, 2026-08-26:
 *  "each section needs to have their own save as draft or save and
 *  submit area... needs to have a revert back to previous [state]").
 *  Only rendered on the main /admin/content page (not the narrower
 *  revise-a-single-request flow, which keeps its existing single draft/
 *  submit toggle at the bottom — resuming one specific request doesn't
 *  need per-section granularity the way the primary editing page does).
 *
 *  Reads field values directly from the section's own DOM subtree
 *  (input/textarea elements with a `name`) rather than needing a
 *  hardcoded list of field names per section — stays correct
 *  automatically if a section's fields ever change. Revert similarly
 *  just resets each input to its own `.defaultValue` (what the page
 *  loaded with), no separate "original value" bookkeeping needed. */
function SectionControls({
  sectionRef,
  legend,
  isEditor,
}: {
  sectionRef: React.RefObject<HTMLDivElement | null>;
  legend: string;
  isEditor: boolean;
}) {
  const [state, setState] = useState<FormState>(undefined);
  const [draftState, setDraftState] = useState<DraftFormState>(undefined);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function collectFieldValues(): Record<string, string> {
    const values: Record<string, string> = {};
    sectionRef.current
      ?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]")
      .forEach((input) => {
        values[input.name] = input.value;
      });
    return values;
  }

  function handleSave() {
    setState(undefined);
    startTransition(async () => {
      setState(await saveContentSection(collectFieldValues()));
    });
  }

  function handleSaveDraft() {
    setDraftState(undefined);
    startTransition(async () => {
      const result = await saveContentSectionDraft(collectFieldValues());
      setDraftState(result);
      if (result?.ok && result.draftId) {
        router.push(`/admin/approvals/${result.draftId}/revise`);
      }
    });
  }

  function handleRevert() {
    if (!confirm(`Revert "${legend}" back to how it was when the page loaded?`)) return;
    sectionRef.current
      ?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[name], textarea[name]")
      .forEach((input) => {
        input.value = input.defaultValue;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    setState(undefined);
    setDraftState(undefined);
  }

  return (
    <div className="border-border mt-4 space-y-3 border-t pt-4">
      {(state?.error || draftState?.error) && (
        <p className="text-destructive text-sm" role="alert">
          {state?.error || draftState?.error}
        </p>
      )}
      {draftState?.ok && (
        <p className="text-sm text-blue-700" role="status">
          Saved as a draft — not submitted for review yet.
        </p>
      )}
      {state?.ok && state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          Submitted for admin approval.
        </p>
      )}
      {state?.ok && !state?.pending && (
        <p className="text-sm text-[#72D35B]" role="status">
          Saved — this section is now live.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {isEditor ? (
          <>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={pending}
              className="font-heading border-border rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save as draft"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {pending ? "Submitting…" : "Submit for review"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save section"}
          </button>
        )}
        <button
          type="button"
          onClick={handleRevert}
          className="font-heading text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Revert
        </button>
      </div>
    </div>
  );
}

/** Wraps one Fieldset with a scroll-anchor id (for the jump-nav) and,
 *  when enabled, its own SectionControls row. */
function Section({
  id,
  legend,
  onPreview,
  showControls,
  isEditor,
  className,
  children,
}: {
  id: string;
  legend: string;
  onPreview?: () => void;
  showControls: boolean;
  isEditor: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={sectionRef} id={id} className="scroll-mt-24">
      <GlowFieldset legend={legend} onPreview={onPreview} className={className}>
        {children}
        {showControls && <SectionControls sectionRef={sectionRef} legend={legend} isEditor={isEditor} />}
      </GlowFieldset>
    </div>
  );
}

const SECTION_NAV = [
  { id: "section-brand", label: "Brand" },
  { id: "section-event-cta", label: "Event CTA" },
  { id: "section-trust-stats", label: "Trust Stats" },
  { id: "section-services", label: "Services" },
  { id: "section-testimonials", label: "Testimonials" },
  { id: "section-team", label: "Team" },
  { id: "section-social", label: "Social links" },
];

type SectionPreviewState = { title: string; node: React.ReactNode } | null;

export function ContentForm({
  content,
  resolved,
  reviseRequestId,
  role,
  status,
}: {
  content: SiteContent;
  // Only present on the main /admin/content page — the narrower "revise a
  // single already-submitted content request" flow (approvals/[id]/revise)
  // has no coherent per-slot image story (images are always their own
  // separate request row), so it renders ContentForm without this and the
  // embedded image slots below just don't render.
  resolved?: Awaited<ReturnType<typeof getSiteContent>>;
  reviseRequestId?: string;
  /** Drives the Save/Draft/Submit button set below — admin always gets a
   *  single live "Save changes" button; editor gets a draft/submit split,
   *  except when resuming an already-submitted (pending/changes_requested)
   *  row, which keeps the single "Resubmit for review" button unchanged. */
  role?: "editor" | "admin";
  /** The row's current status, only meaningful alongside reviseRequestId. */
  status?: string;
}) {
  const action = reviseRequestId ? updateOwnContentRequest.bind(null, reviseRequestId) : saveContent;
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [previewContent, setPreviewContent] = useState<SiteContent | null>(null);
  const [sectionPreview, setSectionPreview] = useState<SectionPreviewState>(null);
  const router = useRouter();
  const [draftState, setDraftState] = useState<DraftFormState>(undefined);
  const [savingDraft, startDraftTransition] = useTransition();

  const isEditor = role === "editor";
  const isFreshDraftFlow = isEditor && !reviseRequestId;
  const isResumingDraft = isEditor && reviseRequestId && status === "draft";
  // Per-section controls only make sense on the primary editing page, not
  // while resuming one specific already-submitted request.
  const showSectionControls = !reviseRequestId;

  function handleSaveDraft() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startDraftTransition(async () => {
      const result = await saveContentDraft(undefined, fd);
      setDraftState(result);
      if (result?.ok && result.draftId) {
        router.push(`/admin/approvals/${result.draftId}/revise`);
      }
    });
  }

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
    <div className="space-y-6">
      {/* Jump-nav (queue item 3, 2026-08-26): "not a menu, but... they
          need to be able to filter through what they are changing." A
          sticky row of anchor links into the sections below, rather than
          scrolling through a ~7-section form to find the one that matters. */}
      <div className="border-border bg-card sticky top-16 z-10 -mx-1 flex flex-wrap gap-1 rounded-xl border p-2 shadow-sm">
        {SECTION_NAV.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>

      <form ref={formRef} action={formAction} className="space-y-6">
      <Section
        id="section-brand"
        legend="Brand"
        showControls={showSectionControls}
        isEditor={isEditor}
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
      </Section>

      <Section
        id="section-event-cta"
        legend="Event CTA"
        showControls={showSectionControls}
        isEditor={isEditor}
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
      </Section>

      <Section
        id="section-trust-stats"
        legend="Trust Stats"
        showControls={showSectionControls}
        isEditor={isEditor}
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
      </Section>

      <Section
        id="section-services"
        legend="Services"
        showControls={showSectionControls}
        isEditor={isEditor}
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
      </Section>

      <Section
        id="section-testimonials"
        legend="Testimonials"
        showControls={showSectionControls}
        isEditor={isEditor}
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
      </Section>

      <Section
        id="section-team"
        legend="Team"
        showControls={showSectionControls}
        isEditor={isEditor}
        onPreview={() => handlePreviewSection("Team", (c) => <TeamSection team={c.team} />)}
      >
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
      </Section>

      <Section
        id="section-social"
        legend="Social links"
        showControls={showSectionControls}
        isEditor={isEditor}
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
      </Section>

      {(state?.error || draftState?.error) && (
        <p className="text-destructive text-sm" role="alert">
          {state?.error || draftState?.error}
        </p>
      )}
      {state?.ok && state?.draft && (
        <p className="text-sm text-blue-700" role="status">
          Saved as a draft — not submitted for review yet. Come back anytime to keep editing
          or submit it.
        </p>
      )}
      {state?.ok && state?.pending && !state?.draft && (
        <p className="text-sm text-[#72D35B]" role="status">
          {reviseRequestId ? "Resubmitted" : "Submitted"} for admin approval — it
          won&apos;t go live until it&apos;s reviewed. Check &quot;Approvals&quot; for
          the status.
        </p>
      )}
      {state?.ok && !state?.pending && !state?.draft && (
        <p className="text-sm text-[#72D35B]" role="status">
          Saved: the live homepage now reflects these changes.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Or save everything at once:
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {isResumingDraft ? (
          <>
            <button
              type="submit"
              name="mode"
              value="draft"
              className="font-heading border-border rounded-xl border px-6 py-2.5 text-sm font-semibold"
            >
              Save draft
            </button>
            <button
              type="submit"
              name="mode"
              value="submit"
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Submit for review
            </button>
          </>
        ) : isFreshDraftFlow ? (
          <>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="font-heading border-border rounded-xl border px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {savingDraft ? "Saving…" : "Save as draft"}
            </button>
            <SaveButton label="Submit for review" />
          </>
        ) : (
          <SaveButton label={reviseRequestId ? "Resubmit for review" : "Save changes"} />
        )}
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
    </div>
  );
}
