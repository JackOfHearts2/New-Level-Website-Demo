"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession } from "@/lib/auth";

export type LoginState = { error: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!process.env.ADMIN_PASSWORD) {
    return { error: "Admin login isn't configured yet." };
  }

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Wrong password." };
  }

  const ok = await createSession();
  if (!ok) {
    return { error: "Admin login isn't configured yet." };
  }

  redirect("/admin");
}
