import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/content";

export function TestimonialsSection() {
  return (
    <section className="bg-muted/50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            Testimonials
          </span>
          <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
            What clients say, straight from the source.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="bg-background border-border flex flex-col rounded-2xl border p-6 shadow-sm"
            >
              <blockquote className="text-foreground flex-1 text-balance">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="border-border mt-6 border-t pt-4">
                <div className="font-heading text-sm font-semibold">
                  {t.name}
                </div>
                <div className="text-muted-foreground text-xs">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/testimonials"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "font-heading rounded-xl px-6 font-semibold"
            )}
          >
            Read more testimonials
          </Link>
        </div>
      </div>
    </section>
  );
}
