"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { SiteContent } from "@/lib/site-content";
import { saveContent, type FormState } from "../actions";

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
    "border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  return (
    <label className="block text-sm">
      <span className="font-heading font-medium">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          className={className}
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

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border-border space-y-4 rounded-2xl border p-6">
      <legend className="font-heading px-1 text-sm font-semibold">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save changes"}
    </button>
  );
}

export function ContentForm({ content }: { content: SiteContent }) {
  const [state, formAction] = useActionState<FormState, FormData>(
    saveContent,
    undefined
  );

  return (
    <form action={formAction} className="space-y-6">
      <Fieldset legend="Brand">
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
      </Fieldset>

      <Fieldset legend="Event CTA">
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

      <Fieldset legend="Trust Stats">
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

      <Fieldset legend="Services">
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

      <Fieldset legend="Testimonials">
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
          </div>
        ))}
      </Fieldset>

      <Fieldset legend="Team">
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
          </div>
        ))}
      </Fieldset>

      <Fieldset legend="Social links">
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
      {state?.ok && (
        <p className="text-sm text-[#72D35B]" role="status">
          Saved — the live homepage now reflects these changes.
        </p>
      )}
      <SaveButton />
    </form>
  );
}
