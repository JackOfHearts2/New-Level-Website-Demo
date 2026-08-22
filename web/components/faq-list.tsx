import { ChevronDown } from "lucide-react";

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border">
      {faqs.map((faq) => (
        <details key={faq.q} className="group py-5">
          <summary className="font-heading marker:content-none flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            {faq.q}
            <ChevronDown className="text-foreground size-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="text-foreground mt-3 text-sm text-balance">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}
