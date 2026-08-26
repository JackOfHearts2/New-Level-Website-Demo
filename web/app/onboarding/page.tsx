import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./onboarding-flow";

// Landing page after an invite link — /auth/callback exchanges the invite
// code for a real session first (same flow /auth/reset-password uses for
// password-recovery links), so by the time someone lands here they're
// already signed in as the invited user; this just needs to confirm that.
export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="border-border w-full max-w-sm rounded-2xl border p-8 shadow-lg">
        <OnboardingFlow />
      </div>
    </div>
  );
}
