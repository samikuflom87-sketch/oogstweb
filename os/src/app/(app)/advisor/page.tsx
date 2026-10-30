"use client";

import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { AgentRole } from "@/lib/types";
import { AGENT_LIST, AGENTS } from "@/lib/ai/agents";
import { callAdvisor, type AdvisorMessage } from "@/lib/ai/callAdvisor";
import { PageHeader } from "@/components/PageHeader";
import { IconAdvisor } from "@/components/icons";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface ChatMessage extends AdvisorMessage {
  id: string;
  submitted?: boolean;
}

export default function AdvisorPage() {
  const [role, setRole] = useState<AgentRole>("ceo");
  const [messagesByRole, setMessagesByRole] = useState<Partial<Record<AgentRole, ChatMessage[]>>>({});
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messages = messagesByRole[role] ?? [];
  const setMessages = (next: ChatMessage[] | ((old: ChatMessage[]) => ChatMessage[])) => {
    setMessagesByRole((prev) => {
      const old = prev[role] ?? [];
      return { ...prev, [role]: typeof next === "function" ? next(old) : next };
    });
  };

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("oogstweb-os-advisor-history-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Record<AgentRole, ChatMessage[]>>;
        if (parsed && typeof parsed === "object") setMessagesByRole(parsed);
      }
    } catch { /* Ignore corrupt browser history. */ }
    setHistoryLoaded(true);
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    try {
      const trimmed = Object.fromEntries(Object.entries(messagesByRole).map(([key, value]) => [key, (value || []).slice(-40)]));
      window.localStorage.setItem("oogstweb-os-advisor-history-v1", JSON.stringify(trimmed));
    } catch { /* Browser storage unavailable or full. */ }
  }, [messagesByRole, historyLoaded]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const [memory, setMemory] = useState<Array<{ id: string; title: string; content: string; verified: boolean }>>([]);
  const [memoryInput, setMemoryInput] = useState("");
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryError, setMemoryError] = useState("");
  const [showMemory, setShowMemory] = useState(false);

  async function loadMemory() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await getSupabaseBrowserClient().from("business_memory").select("id,title,content,verified").order("updated_at", { ascending: false }).limit(30);
    if (error) { setMemoryError(error.message); return; }
    setMemory(data ?? []);
  }

  async function saveMemory() {
    if (!memoryTitle.trim() || !memoryInput.trim() || !isSupabaseConfigured) return;
    const { error } = await getSupabaseBrowserClient().from("business_memory").insert({ title: memoryTitle.trim(), content: memoryInput.trim(), source: "manual", verified: true });
    if (error) { setMemoryError(error.message); return; }
    setMemoryTitle(""); setMemoryInput(""); setMemoryError(""); await loadMemory();
  }

  useEffect(() => { void loadMemory(); }, []);

  const agent = AGENTS[role];
  const sideEffectAction = agent.allowedActions.find((a) => a.tier > 1);

  async function send() {
    if (!input.trim() || loading || !historyLoaded) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    const provider = getDataProvider();
    let businessContext: Record<string, unknown> = {};
    try {
      const [companies, tasks, projects, goals] = await Promise.all([
        provider.listCompanies(), provider.listTasks(), provider.listProjects(), provider.listGoals(),
      ]);
      businessContext = {
        companies: companies.slice(0, 20).map((c) => ({ name: c.name, city: c.city, pipeline_stage: c.pipeline_stage, website_url: c.website_url })),
        tasks: tasks.slice(0, 15).map((t) => ({ title: t.title, status: t.status, due_date: t.due_date })),
        projects: projects.slice(0, 12).map((p) => ({ name: p.name, status: p.status, deadline: p.deadline })),
        goals: goals.slice(0, 10).map((g) => ({ title: g.title, metric_current: g.metric_current, metric_target: g.metric_target })),
      };
    } catch {
      businessContext = { warning: "Actuele CRM-gegevens konden niet worden geladen." };
    }
    businessContext.sharedMemory = memory.map((m) => ({ title: m.title, content: m.content, verified: m.verified }));
    let result;
    try {
      result = await callAdvisor(role, history.slice(-12).map((m) => ({ role: m.role, content: m.content })), businessContext);
    } catch (error) {
      result = { connected: true, text: "", error: error instanceof Error ? error.message : "Netwerkfout" };
    }
    setLoading(false);
    setNotConnected(!result.connected);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: result.error ? `Fout: ${result.error}` : result.text,
    };
    setMessages([...history, assistantMsg]);

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
        description="Gesprekken worden per agent in deze browser bewaard. De AI gebruikt ook je actuele Oogstweb OS-bedrijfsgegevens. Geen automatische ChatGPT-synchronisatie."
      />

      <div className="mb-3 flex items-center gap-3"><button className="btn-primary text-xs" onClick={() => setShowMemory(!showMemory)}>{showMemory ? "Sluit bedrijfsgeheugen" : `Bedrijfsgeheugen (${memory.length})`}</button><span className="text-xs text-ink-muted">Gedeeld via Supabase; alleen handmatig bevestigde gegevens.</span></div>
      {showMemory ? <div className="card mb-4 space-y-3 p-4"><h3 className="font-semibold">Vastgelegde Oogstweb-feiten</h3><p className="text-xs text-ink-muted">Voeg alleen feiten toe die AI-providers mogen verwerken. Dit is geen automatische ChatGPT-synchronisatie.</p>{memory.map((m) => <div key={m.id} className="text-sm"><strong>{m.title}:</strong> {m.content}</div>)}<input className="input w-full" placeholder="Onderwerp (bijv. prijzen)" value={memoryTitle} onChange={(e) => setMemoryTitle(e.target.value)} /><textarea className="input w-full" placeholder="Bevestigde informatie..." value={memoryInput} onChange={(e) => setMemoryInput(e.target.value)} /><button className="btn-primary" onClick={saveMemory}>Bewaar in bedrijfsgeheugen</button>{memoryError && <p className="text-xs text-danger">{memoryError}</p>}</div> : null}
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
          De AI-adviseur is nog niet verbonden. Voeg <code>OPENROUTER_API_KEY</code> of <code>ANTHROPIC_API_KEY</code> toe aan
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
