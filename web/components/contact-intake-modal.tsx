"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SOCIAL_ICONS } from "@/components/social-icons";
import { CONTACT_TOPICS, POINT_OF_CONTACT, SOCIALS } from "@/lib/content";

// Split hero-image / form-card layout, per the client's pasted reference —
// same mechanics (background photo, email + socials row, topic checkbox
// grid, message form) ported literally, real New Level content in place of
// the reference's generic web-agency copy and stock categories.
export function ContactIntakeModal({ onClose }: { onClose: () => void }) {
  const [topics, setTopics] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  function toggleTopic(id: string, checked: boolean) {
    setTopics((prev) => (checked ? [...prev, id] : prev.filter((t) => t !== id)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    // Same demo-only convention as InquiryForm — no live endpoint behind
    // this yet, so it confirms without actually sending anywhere.
    setSubmitted(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url(/photos/00.jpg)" }}
      />
      <div aria-hidden className="fixed inset-0 -z-10 bg-black/60" />

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-6 py-16 lg:grid-cols-2 lg:gap-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="fixed top-6 right-6 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col justify-center">
          <span className="bg-white/10 font-heading inline-block w-fit rounded-full px-4 py-1.5 text-sm font-semibold text-white uppercase backdrop-blur-sm">
            Get in Touch
          </span>
          <h1 className="font-heading mt-6 max-w-lg text-4xl font-bold text-balance text-white drop-shadow-lg md:text-5xl">
            Let&apos;s find the space for your next moment.
          </h1>
          <p className="mt-4 max-w-md text-lg text-balance text-white">
            Whether it&apos;s a property, an investment, or an event —
            tell us what you&apos;re planning and we&apos;ll take it from
            there.
          </p>
        </div>

        <div className="border-border bg-popover rounded-2xl border p-6 shadow-2xl md:p-8">
          {submitted ? (
            <div className="py-8 text-center">
              <h2 className="font-heading text-xl font-bold">
                Thanks — we&apos;ve got it.
              </h2>
              <p className="text-foreground mt-2 text-sm">
                We&apos;ll follow up as soon as we can.
              </p>
              <p className="text-foreground mt-4 text-sm">
                Demo mode: this message wasn&apos;t actually sent anywhere.
              </p>
              <Button className="mt-6 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold">
                Reach out to New Level
              </h2>

              <div className="mb-6">
                <p className="text-foreground mb-2">Mail us at</p>
                <a
                  href={`mailto:${POINT_OF_CONTACT.email}`}
                  className="text-primary font-medium hover:underline"
                >
                  {POINT_OF_CONTACT.email}
                </a>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-foreground">OR</span>
                  {SOCIALS.map((s) => {
                    const Icon = SOCIAL_ICONS[s.id];
                    return (
                      <a
                        key={s.id}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.name}
                        className="border-border hover:bg-muted flex size-9 items-center justify-center rounded-lg border"
                      >
                        {Icon && <Icon className="size-4" />}
                      </a>
                    );
                  })}
                </div>
              </div>

              <hr className="border-border my-6" />

              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-foreground">Leave us a brief message</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  <Label htmlFor="contact-message">
                    Briefly describe what you&apos;re looking for
                  </Label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    placeholder="Tell us a bit about it…"
                    className="min-h-20"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-foreground">I&apos;m reaching out about…</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {CONTACT_TOPICS.map((topic) => (
                      <div key={topic.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={topics.includes(topic.id)}
                          onCheckedChange={(checked) =>
                            toggleTopic(topic.id, checked === true)
                          }
                        />
                        <Label htmlFor={`topic-${topic.id}`} className="text-sm font-normal">
                          {topic.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Send a message
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
