"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { withdrawRequest } from "./actions";

export function EditWithdrawButtons({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleWithdraw() {
    startTransition(async () => {
      await withdrawRequest(id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-3 border-t pt-4">
      <Link
        href={`/admin/approvals/${id}/revise`}
        className="font-heading border-border rounded-lg border px-4 py-2 text-sm font-semibold"
      >
        Revise
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={handleWithdraw}
        className="text-destructive font-heading text-sm font-semibold disabled:opacity-50"
      >
        {isPending ? "Withdrawing…" : "Withdraw"}
      </button>
    </div>
  );
}
