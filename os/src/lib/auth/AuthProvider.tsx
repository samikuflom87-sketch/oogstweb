"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthUser {
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  mode: "supabase" | "demo";
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const DEMO_SESSION_KEY = "oogstweb-os-demo-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      const sb = getSupabaseBrowserClient();
      sb.auth.getSession().then(({ data }) => {
        const email = data.session?.user.email;
        setUser(email ? { email, name: email.split("@")[0] } : null);
        setLoading(false);
      });
      const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
        const email = session?.user.email;
        setUser(email ? { email, name: email.split("@")[0] } : null);
      });
      return () => sub.subscription.unsubscribe();
    }

    try {
      const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (isSupabaseConfigured) {
      const sb = getSupabaseBrowserClient();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    }
    if (!email || !password) return { error: "Vul e-mailadres en wachtwoord in." };
    const demoUser: AuthUser = { email, name: email.split("@")[0] || "Eigenaar" };
    try {
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoUser));
    } catch {
      // ignore
    }
    setUser(demoUser);
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await getSupabaseBrowserClient().auth.signOut();
    } else {
      try {
        window.localStorage.removeItem(DEMO_SESSION_KEY);
      } catch {
        // ignore
      }
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, mode: isSupabaseConfigured ? "supabase" : "demo", signIn, signOut }),
    [user, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth moet binnen AuthProvider gebruikt worden.");
  return ctx;
}
