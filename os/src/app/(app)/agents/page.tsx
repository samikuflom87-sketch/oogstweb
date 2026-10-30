"use client";

import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { AgentRun, Approval } from "@/lib/types";
import { AGENT_LIST, AGENTS } from "@/lib/ai/agents";
import { PageHeader } from "@/components/PageHeader";
import { formatDateTime } from "@/lib/format";
import { IconAlert, IconCheck, IconClose } from "@/components/icons";

const TIER_LABEL: Record<1 | 2 | 3, { label: string; className: string }> = {
  1: { label: "Tier 1 · automatisch", className: "border-positive/30 bg-positive/10 text-positive" },
  2: { label: "Tier 2 · goedkeuring", className: "border-warning/30 bg-warning/10 text-warning" },
  3: { label: "Tier 3 · autorisatie", className: "border-danger/30 bg-danger/10 text-danger" },
};

export default function AgentsPage() {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const provider = getDataProvider();
    const [r, a] = await Promise.all([provider.listAgentRuns(), provider.listApprovals()]);
    setRuns(r);
    setApprovals(a);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function decide(approvalId: string, decision: "goedgekeurd" | "afgewezen") {
    setBusyId(approvalId);
    const provider = getDataProvider();
    await provider.decideApproval(approvalId, decision);
    setBusyId(null);
    refresh();
  }

  const openApprovals = approvals.filter((a) => a.status === "open");

  return (
    <div>
      <PageHeader
        title="AI Agent control center"
        description="Acht gespecialiseerde agents, samenwerkend via één orchestrator, met volledig auditlog en goedkeuringsplicht voor alles wat buiten dit systeem komt."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {AGENT_LIST.map((agent) => (
          <div key={agent.role} className="card p-4">
            <h3 className="text-sm font-semibold">{agent.name}</h3>
            <p className="mt-0.5 text-xs text-ink-muted">{agent.tagline}</p>
            <ul className="mt-2 space-y-1 text-xs text-ink-faint">
              {agent.responsibilities.map((r) => (
                <li key={r}>· {r}</li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1">
              {agent.allowedActions.map((a) => (
                <span key={a.id} className={`badge border ${TIER_LABEL[a.tier].className}`}>
                  {a.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 card p-5">
        <div className="mb-3 flex items-center gap-2">
          <IconAlert className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-semibold">Wacht op jouw goedkeuring ({openApprovals.length})</h2>
        </div>
        {openApprovals.length === 0 ? (
          <p className="text-sm text-ink-muted">Niets wacht momenteel op goedkeuring.</p>
        ) : (
          <div className="space-y-3">
            {openApprovals.map((a) => {
              const run = runs.find((r) => r.id === a.agent_run_id);
              return (
                <div key={a.id} className="rounded-lg border border-border bg-surface-elevated p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{a.summary}</p>
                      {run ? (
                        <span className={`badge mt-1 border ${TIER_LABEL[run.permission_tier].className}`}>
                          {TIER_LABEL[run.permission_tier].label}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(a.id, "goedgekeurd")}
                        disabled={busyId === a.id}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        <IconCheck className="h-3.5 w-3.5" /> Goedkeuren
                      </button>
                      <button
                        onClick={() => decide(a.id, "afgewezen")}
                        disabled={busyId === a.id}
                        className="btn-danger px-3 py-1.5 text-xs"
                      >
                        <IconClose className="h-3.5 w-3.5" /> Afwijzen
                      </button>
                    </div>
                  </div>
                  {typeof a.payload?.concept === "string" ? (
                    <p className="mt-2 whitespace-pre-wrap rounded-md bg-base-raised p-2 text-xs text-ink-muted">
                      {a.payload.concept}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[11px] text-ink-faint">
                    Let op: goedkeuren markeert deze actie als geautoriseerd in het systeem. Oogstweb OS heeft nog
                    geen verzend-integratie (e-mail/telefonie) gekoppeld, dus er wordt in deze MVP niets automatisch
                    daadwerkelijk verstuurd.
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold">Activiteitenlogboek</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Actie</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Tijd</th>
              </tr>
            </thead>
            <tbody>
              {!loading && runs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-ink-muted">
                    Nog geen agentactiviteit.
                  </td>
                </tr>
              ) : null}
              {runs.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-3 py-2 font-medium">{AGENTS[r.agent_role].name}</td>
                  <td className="px-3 py-2 text-ink-muted">{r.action.replaceAll("_", " ")}</td>
                  <td className="px-3 py-2">
                    <span className={`badge border ${TIER_LABEL[r.permission_tier].className}`}>
                      {TIER_LABEL[r.permission_tier].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-ink-muted">{r.status.replaceAll("_", " ")}</td>
                  <td className="px-3 py-2 text-ink-faint">{formatDateTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
