"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import type { AgentRun, BusinessGoal, Company, FinancialEntry, Task } from "@/lib/types";
import { AGENTS } from "@/lib/ai/agents";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatEUR, relativeFromNow } from "@/lib/format";
import { IconChevronRight } from "@/components/icons";

const PIPELINE_LABELS: Record<string, string> = {
  nieuw: "Nieuw",
  gecontacteerd: "Gecontacteerd",
  offerte: "Offerte",
  klant: "Klant",
  verloren: "Verloren",
};

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [goals, setGoals] = useState<BusinessGoal[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"supabase" | "demo">("demo");

  useEffect(() => {
    const provider = getDataProvider();
    setMode(provider.mode);
    Promise.all([
      provider.listCompanies(),
      provider.listTasks(),
      provider.listFinancialEntries(),
      provider.listGoals(),
      provider.listAgentRuns(),
    ]).then(([c, t, f, g, r]) => {
      setCompanies(c);
      setTasks(t);
      setEntries(f);
      setGoals(g);
      setRuns(r);
      setLoading(false);
    });
  }, []);

  const metrics = useMemo(() => {
    const now = new Date();
    const inThisMonth = (iso: string) => {
      const d = new Date(iso);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };
    const income = entries.filter((e) => e.entry_type === "inkomst" && inThisMonth(e.entry_date));
    const expense = entries.filter((e) => e.entry_type === "uitgave" && inThisMonth(e.entry_date));
    const incomeTotal = income.reduce((s, e) => s + e.amount, 0);
    const expenseTotal = expense.reduce((s, e) => s + e.amount, 0);
    const leads = companies.filter((c) => c.type === "lead");
    const openTasks = tasks.filter((t) => t.status !== "klaar");
    const overdue = tasks.filter((t) => t.status !== "klaar" && t.due_date && t.due_date < now.toISOString().slice(0, 10));
    return {
      incomeTotal,
      expenseTotal,
      netTotal: incomeTotal - expenseTotal,
      leadsCount: leads.length,
      openTasksCount: openTasks.length,
      overdueCount: overdue.length,
    };
  }, [companies, tasks, entries]);

  const pipelineBreakdown = useMemo(() => {
    const stages = ["nieuw", "gecontacteerd", "offerte", "klant", "verloren"];
    const total = companies.length || 1;
    return stages.map((stage) => {
      const count = companies.filter((c) => c.pipeline_stage === stage).length;
      return { stage, count, pct: Math.round((count / total) * 100) };
    });
  }, [companies]);

  if (loading) {
    return <div className="text-sm text-ink-muted">Dashboard wordt geladen…</div>;
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Actueel overzicht van leads, pijplijn, financiën en AI-agentactiviteit."
        action={mode === "demo" ? <span className="demo-badge">Demo-data</span> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Omzet deze maand"
          value={formatEUR(metrics.incomeTotal)}
          sub={`${formatEUR(metrics.netTotal)} netto na kosten`}
          trend={metrics.netTotal >= 0 ? "up" : "down"}
        />
        <StatCard label="Actieve leads" value={String(metrics.leadsCount)} sub="in onderzoek of opvolging" />
        <StatCard
          label="Openstaande taken"
          value={String(metrics.openTasksCount)}
          sub={metrics.overdueCount > 0 ? `${metrics.overdueCount} over datum` : "alles op schema"}
          trend={metrics.overdueCount > 0 ? "down" : "flat"}
        />
        <StatCard label="AI-acties deze periode" value={String(runs.length)} sub="automatisch + goedkeuring" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Pijplijn per fase</h2>
            <Link href="/crm" className="flex items-center gap-1 text-xs text-accent hover:underline">
              Naar CRM <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {pipelineBreakdown.map((row) => (
              <div key={row.stage}>
                <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                  <span>{PIPELINE_LABELS[row.stage]}</span>
                  <span>{row.count}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-elevated">
                  <div
                    className="h-2 rounded-full bg-accent transition-all"
                    style={{ width: `${Math.max(row.pct, row.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Bedrijfsdoelen</h2>
            <Link href="/goals" className="flex items-center gap-1 text-xs text-accent hover:underline">
              Alle doelen <IconChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const pct = goal.metric_target ? Math.min(100, Math.round((goal.metric_current / goal.metric_target) * 100)) : 0;
              return (
                <div key={goal.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-ink">{goal.title}</span>
                    <span className="text-ink-muted">
                      {goal.metric_current}
                      {goal.unit ? ` ${goal.unit}` : ""} / {goal.metric_target}
                      {goal.unit ? ` ${goal.unit}` : ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-elevated">
                    <div className="h-2 rounded-full bg-positive" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recente AI-agentactiviteit</h2>
          <Link href="/agents" className="flex items-center gap-1 text-xs text-accent hover:underline">
            Volledig overzicht <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {runs.slice(0, 5).map((run) => (
            <div key={run.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <div>
                <span className="font-medium text-ink">{AGENTS[run.agent_role].name}</span>
                <span className="text-ink-muted"> · {run.action.replaceAll("_", " ")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-faint">
                <StatusBadge status={run.status} />
                <span>{relativeFromNow(run.created_at)}</span>
              </div>
            </div>
          ))}
          {runs.length === 0 ? <p className="py-4 text-sm text-ink-muted">Nog geen agentactiviteit.</p> : null}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AgentRun["status"] }) {
  const map: Record<AgentRun["status"], string> = {
    automatisch_uitgevoerd: "border-positive/30 bg-positive/10 text-positive",
    wacht_op_goedkeuring: "border-warning/30 bg-warning/10 text-warning",
    goedgekeurd: "border-positive/30 bg-positive/10 text-positive",
    afgewezen: "border-danger/30 bg-danger/10 text-danger",
    mislukt: "border-danger/30 bg-danger/10 text-danger",
  };
  const label: Record<AgentRun["status"], string> = {
    automatisch_uitgevoerd: "automatisch",
    wacht_op_goedkeuring: "wacht op goedkeuring",
    goedgekeurd: "goedgekeurd",
    afgewezen: "afgewezen",
    mislukt: "mislukt",
  };
  return <span className={`badge border ${map[status]}`}>{label[status]}</span>;
}
