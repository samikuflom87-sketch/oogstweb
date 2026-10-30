"use client";

import { useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { AgentRole } from "@/lib/types";
import { AGENT_LIST, AGENTS } from "@/lib/ai/agents";
import { callAdvisor, type AdvisorMessage } from "@/lib/ai/callAdvisor";
import { PageHeader } from "@/components/PageHeader";
import { IconAdvisor } from "@/components/icons";

interface ChatMessage extends AdvisorMessage {
  id: string;
  submitted?: boolean;
}

export default function AdvisorPage() {
  const [role, setRole] = useState<AgentRole>("ceo");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);

  const agent = AGENTS[role];
  const sideEffectAction = agent.allowedActions.find((a) => a.tier > 1);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const result = await callAdvisor(
      role,
      history.map((m) => ({ role: m.role, content: m.content }))
    );
    setLoading(false);
    setNotConnected(!result.connected);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.error ? `Fout: ${result.error}` : result.text,
    };
    setMessages([...history, assistantMsg]);

    const provider = getDataProvider();
    await provider.createAgentRun({
      agent_role: role,
      action: "strategisch_advies",
      permission_tier: 1,
      input: { vraag: userMsg.content },
      output: { antwoord: assistantMsg.content },
    });
  }

  async function submitForApproval(message: ChatMessage) {
    if (!sideEffectAction) return;
    const provider = getDataProvider();
    await provider.createAgentRun({
      agent_role: role,
      action: sideEffectAction.id,
      permission_tier: sideEffectAction.tier,
      input: { concept: message.content },
      related_company_id: null,
    });
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, submitted: true } : m)));
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <PageHeader
        title="AI-adviseur"
        description="Eén orchestrator, meerdere rollen — kies de rol die past bij je vraag. Elk antwoord is advies; niets wordt automatisch verzonden."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {AGENT_LIST.map((a) => (
          <button
            key={a.role}
            onClick={() => setRole(a.role)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              role === a.role ? "border-accent/50 bg-accent/15 text-ink" : "border-border text-ink-muted hover:bg-surface-hover"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {notConnected ? (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          De AI-adviseur is nog niet verbonden met een Anthropic API-key. Voeg <code>ANTHROPIC_API_KEY</code> toe aan
          de omgevingsvariabelen om deze rol echt te laten antwoorden.
        </div>
      ) : null}

      <div className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-ink-muted">
              <IconAdvisor className="mb-3 h-8 w-8 text-accent" />
              <p className="text-sm">
                Je spreekt nu met de <strong>{agent.name}</strong>: {agent.tagline.toLowerCase()}.
              </p>
            </div>
          ) : null}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl2 px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-accent text-white" : "bg-surface-elevated text-ink"
                }`}
              >
                {m.content}
                {m.role === "assistant" && sideEffectAction ? (
                  <div className="mt-2 border-t border-border/50 pt-2">
                    <button
                      disabled={m.submitted}
                      onClick={() => submitForApproval(m)}
                      className="text-xs text-accent hover:underline disabled:text-ink-faint disabled:no-underline"
                    >
                      {m.submitted
                        ? "Ingediend ter goedkeuring ✓"
                        : `Indienen als "${sideEffectAction.label}" (tier ${sideEffectAction.tier})`}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? <div className="text-sm text-ink-faint">{agent.name} denkt na…</div> : null}
        </div>

        <div className="flex gap-2 border-t border-border p-3">
          <input
            className="input flex-1"
            placeholder={`Vraag het de ${agent.name}…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} disabled={loading} className="btn-primary">
            Versturen
          </button>
        </div>
      </div>
    </div>
  );
}
