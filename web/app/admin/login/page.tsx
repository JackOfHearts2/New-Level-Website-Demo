import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="border-border w-full max-w-sm rounded-2xl border p-8 shadow-sm">
        <h1 className="font-heading text-xl font-bold">New Level Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Sign in with your editor or admin account to edit site content and
          photos.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
