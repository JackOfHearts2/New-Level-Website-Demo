"use client";

import { useState, useTransition } from "react";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { GlowCard } from "@/components/ui/glow-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SOCIAL_ICONS } from "@/components/social-icons";
import { cn } from "@/lib/utils";
import { CONTACT_TOPICS, POINT_OF_CONTACT, SOCIALS } from "@/lib/content";
import { submitInquiry } from "@/app/actions/inquiries";

// The real intake form for /contact — this page used to just show the
// point-of-contact's phone/email/WhatsApp with a single-select topic chip
// row that wasn't wired into anything. Replaced with the same form
// mechanics as ContactIntakeModal (the floating "Get in Touch" popup),
// per the client's own reference to it as the template: multi-select
// topic checkboxes (not chips — a visitor can flag more than one reason
// for reaching out), name/email/message fields, and a submit that
// confirms in place. Direct contact info (email/phone/WhatsApp/socials)
// stays available above the form for anyone who'd rather not fill it out.
export function ContactForm({ initialTopic, initialQuery }: { initialTopic?: string; initialQuery?: string }) {
  const [topics, setTopics] = useState<string[]>(
    CONTACT_TOPICS.some((t) => t.id === initialTopic) ? [initialTopic as string] : []
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();

  function toggleTopic(id: string, checked: boolean) {
    setTopics((prev) => (checked ? [...prev, id] : prev.filter((t) => t !== id)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    startSubmit(async () => {
      const result = await submitInquiry({
        source: "contact",
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
        metadata: { topics },
      });
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Message sent");
      setSubmitted(true);
    });
  }

  return (
    <GlowCard className="mx-auto max-w-3xl p-8 md:p-10">
      {submitted ? (
        <div className="py-10 text-center">
          <h2 className="font-heading text-xl font-bold">Thanks, we&apos;ve got it.</h2>
          <p className="text-foreground mt-2 text-sm">
            We&apos;ll follow up as soon as we can.
          </p>
          <Button className="mt-6" onClick={() => setSubmitted(false)}>
            Send another message
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${POINT_OF_CONTACT.email}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "font-heading")}
            >
              <Mail />
              {POINT_OF_CONTACT.email}
            </a>
            <a
              href={`tel:${POINT_OF_CONTACT.phone}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "font-heading")}
            >
              <Phone />
              {POINT_OF_CONTACT.phone}
            </a>
            <a
              href={`https://wa.me/${POINT_OF_CONTACT.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "font-heading")}
            >
              WhatsApp
            </a>
            <span className="text-foreground text-sm">or</span>
            <div className="flex gap-2">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    className="border-border hover:bg-muted hover:-translate-y-0.5 flex size-9 items-center justify-center rounded-lg border transition-all duration-300"
                  >
                    {Icon && <Icon className="size-4" />}
                  </a>
                );
              })}
            </div>
          </div>

          <hr className="border-border my-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="font-heading text-xl font-bold">Send us a message</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Your name</Label>
                <Input id="contact-name" name="name" placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Tell us a bit about what you're looking for…"
                className="min-h-28"
                // Arrives from the site search's "can't find it?" fallback
                // (site-search.tsx) — pre-filled, not auto-submitted, so the
                // visitor can add context before sending.
                defaultValue={initialQuery ? `I searched for "${initialQuery}" and couldn't find it. ` : undefined}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>I&apos;m reaching out about… (choose all that apply)</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CONTACT_TOPICS.map((topic) => (
                  <label
                    key={topic.id}
                    htmlFor={`topic-${topic.id}`}
                    className="border-border hover:border-primary/50 hover:bg-muted flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors duration-200"
                  >
                    <Checkbox
                      id={`topic-${topic.id}`}
                      checked={topics.includes(topic.id)}
                      onCheckedChange={(checked) =>
                        toggleTopic(topic.id, checked === true)
                      }
                    />
                    <span className="font-heading text-sm font-normal">
                      {topic.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </>
      )}
    </GlowCard>
  );
}
