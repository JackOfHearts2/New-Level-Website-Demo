"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShineCircle } from "@/components/ui/shine-shape";

// A dedicated surface for "Ask Shelley a Question" (Broker's Corner), kept
// separate from the general Contact page/form per the client's explicit
// feedback: reaching out to the broker directly should read as its own
// thing, not a preselected topic on the shared intake form. Same overlay/
// spring mechanics the old ContactIntakeModal used, scoped down to a single
// question field — no topic chips, no general point-of-contact info.
export function AskBrokerModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    // Demo-only, same convention as InquiryForm/ContactForm — no live
    // endpoint behind this yet, so it confirms without actually sending.
    setSubmitted(true);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-10"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="border-border bg-popover relative w-full max-w-md rounded-2xl border p-6 shadow-2xl md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-foreground hover:bg-muted absolute top-4 right-4 flex size-8 items-center justify-center rounded-full"
        >
          <X className="size-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <h2 className="font-heading text-xl font-bold">
              Thanks, Shelley&apos;s got your question.
            </h2>
            <p className="text-foreground mt-2 text-sm">
              She personally follows up on these, usually within a couple of days.
            </p>
            <p className="text-foreground mt-4 text-sm">
              Demo mode: this question wasn&apos;t actually sent anywhere.
            </p>
            <Button className="mt-6 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <ShineCircle className="relative size-12 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/team/shelley-lozier.png"
                  alt="Shelley Lozier"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </ShineCircle>
              <div>
                <h2 className="font-heading text-lg font-bold">Ask Shelley a Question</h2>
                <p className="text-foreground text-sm">Founder &amp; Principal Broker</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="broker-name">Your name</Label>
                  <Input id="broker-name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broker-email">Email</Label>
                  <Input
                    id="broker-email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="broker-question">Your question</Label>
                <Textarea
                  id="broker-question"
                  name="question"
                  placeholder="What would you like to ask Shelley?"
                  className="min-h-28"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send to Shelley
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
