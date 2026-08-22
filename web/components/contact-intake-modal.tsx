"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { CONTACT_TOPICS } from "@/lib/content";

export function ContactIntakeModal({ onClose }: { onClose: () => void }) {
  const [topic, setTopic] = useState(CONTACT_TOPICS[0].id);
  const [submitted, setSubmitted] = useState(false);

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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 120, scale: 0.9, rotate: -2 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: 60, scale: 0.92 }}
        transition={{ type: "spring", stiffness: 340, damping: 26 }}
        role="dialog"
        aria-label="Contact New Level"
        className="border-border bg-popover w-full max-w-md rounded-t-3xl border p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-bold">Get in touch</h2>
            <p className="text-foreground mt-1 text-sm">
              Send us a few details and we&apos;ll follow up.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-foreground hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-full"
          >
            <X className="size-4" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 text-center">
            <h3 className="font-heading text-base font-semibold">Thanks — we&apos;ve got it.</h3>
            <p className="text-foreground mt-2 text-sm">
              We&apos;ll follow up as soon as we can.
            </p>
            <p className="text-foreground mt-4 text-sm">
              Demo mode: this message wasn&apos;t actually sent anywhere.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {CONTACT_TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  aria-pressed={topic === t.id}
                  className={
                    topic === t.id
                      ? "font-heading bg-primary text-primary-foreground rounded-full border border-transparent px-3 py-1.5 text-sm font-medium"
                      : "font-heading border-border text-foreground hover:border-primary/50 hover:text-foreground rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
            <label className="block text-sm">
              <span className="font-heading text-sm font-medium">Name</span>
              <input
                name="name"
                required
                className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="block text-sm">
              <span className="font-heading text-sm font-medium">Email</span>
              <input
                type="email"
                name="email"
                required
                className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <label className="block text-sm">
              <span className="font-heading text-sm font-medium">Message</span>
              <textarea
                name="message"
                rows={3}
                required
                className="border-border mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>
            <button
              type="submit"
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 w-full rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Send message
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
