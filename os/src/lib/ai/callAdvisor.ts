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
  const res = await fetch("/api/advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, messages, context }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { connected: data.connected ?? true, text: "", error: data.error ?? "Onbekende fout." };
  }
  return { connected: data.connected ?? true, text: data.text ?? "", error: data.error };
}
