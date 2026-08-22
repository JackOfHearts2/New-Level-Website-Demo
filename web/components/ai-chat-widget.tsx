"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { FAQS } from "@/lib/content";
import { ShineCircle } from "@/components/ui/shine-shape";

type Message = { from: "bot" | "user"; text: string };

const GREETING =
  "Hi! I'm the New Level assistant. Ask me something, or tap a question below — I can answer the basics instantly. For anything more specific, our team's the better call.";

// Simple keyword overlap against the real FAQ content — no live AI backend
// exists behind this yet, so this stays a rule-based canned-answer bot
// (same "UI-only preview" convention as ProfileMenu's Sign In / InquiryForm's
// non-sending submit) rather than pretending to be a real LLM.
function bestFaqMatch(input: string) {
  const words = input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);
  if (words.length === 0) return null;

  let best: { faq: (typeof FAQS)[number]; score: number } | null = null;
  for (const faq of FAQS) {
    const haystack = faq.q.toLowerCase();
    const score = words.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0);
    if (score > 0 && (!best || score > best.score)) best = { faq, score };
  }
  return best?.faq ?? null;
}

export function AiChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  function scrollToEnd() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  function ask(question: string) {
    const match = bestFaqMatch(question);
    const reply = match
      ? match.a
      : "I don't have a canned answer for that one — reach out through Contact and a real person on our team will help.";
    setMessages((m) => [...m, { from: "user", text: question }, { from: "bot", text: reply }]);
    scrollToEnd();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput("");
    ask(q);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, y: 60, scale: 0.75 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, y: 40, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      style={{ transformOrigin: "bottom right" }}
      role="dialog"
      aria-label="Chat with New Level"
      className="border-border bg-popover fixed right-4 bottom-24 z-50 flex h-[32rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border-2 shadow-2xl sm:right-6 sm:bottom-24"
    >
      <div className="border-border flex items-center gap-3 border-b p-4">
        <ShineCircle className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
          <Sparkles className="size-4" />
        </ShineCircle>
        <div className="min-w-0 flex-1">
          <div className="font-heading text-sm font-semibold">New Level Assistant</div>
          <div className="text-muted-foreground text-sm">Instant answers to common questions</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="text-muted-foreground hover:text-foreground hover:bg-muted flex size-8 shrink-0 items-center justify-center rounded-full"
        >
          <X className="size-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.from === "bot"
                ? "bg-muted mr-auto max-w-[85%] rounded-2xl rounded-bl-sm px-3 py-2 text-sm"
                : "bg-primary text-primary-foreground ml-auto max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm"
            }
          >
            {m.text}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {FAQS.slice(0, 3).map((f) => (
              <button
                key={f.q}
                type="button"
                onClick={() => ask(f.q)}
                className="border-border hover:border-primary/50 hover:text-foreground text-muted-foreground rounded-full border px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {f.q}
              </button>
            ))}
          </div>
        )}

        <div className="pt-1 text-center">
          <Link
            href="/contact"
            onClick={onClose}
            className="text-primary text-sm font-semibold hover:underline"
          >
            Talk to a real person instead →
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-border flex gap-2 border-t p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="border-border flex-1 rounded-full border px-4 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          aria-label="Send"
          className="bg-primary text-primary-foreground hover:bg-primary/80 flex size-9 shrink-0 items-center justify-center rounded-full"
        >
          <Send className="size-4" />
        </button>
      </form>
    </motion.div>
  );
}
