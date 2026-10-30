"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function LoginPage() {
  const { user, loading, mode, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-10%] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl2 border border-border bg-surface-elevated text-lg font-semibold tracking-tight text-accent">
            O
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Oogstweb OS</h1>
          <p className="mt-1 text-sm text-ink-muted">Intern bedrijfssysteem &amp; AI-commandocentrum</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          {mode === "demo" ? (
            <p className="demo-badge mb-1 w-full justify-center">Demo-modus — geen Supabase verbonden</p>
          ) : null}

          <div>
            <label className="label-xs mb-1.5 block">E-mailadres</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sami@oogstweb.nl"
              className="input"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="label-xs mb-1.5 block">Wachtwoord</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              autoComplete="current-password"
            />
          </div>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Bezig met inloggen…" : "Inloggen"}
          </button>

          {mode === "demo" ? (
            <p className="text-center text-xs text-ink-faint">
              Vul een willekeurig e-mailadres en wachtwoord in om de demo-omgeving te openen. Zodra je eigen
              Supabase-project is gekoppeld (via omgevingsvariabelen), schakelt dit scherm automatisch over op
              echte, beveiligde authenticatie.
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
