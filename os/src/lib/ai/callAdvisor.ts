import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AgentRole } from "@/lib/types";

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AdvisorResult {
  connected: boolean;
  text: string;
  error?: string;
}

export async function callAdvisor(
  role: AgentRole,
  messages: AdvisorMessage[],
  context?: Record<string, unknown>
): Promise<AdvisorResult> {
  if (!isSupabaseConfigured) return { connected: false, text: "", error: "Log in met Supabase om de AI te gebruiken." };
  const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
  if (!session) return { connected: false, text: "", error: "Je bent niet ingelogd." };
  const res = await fetch("/api/advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ role, messages, context }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { connected: data.connected ?? true, text: "", error: data.error ?? "Onbekende fout." };
  }
  return { connected: data.connected ?? true, text: data.text ?? "", error: data.error };
}
