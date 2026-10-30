"use client";

import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { BusinessGoal } from "@/lib/types";
import { callAdvisor } from "@/lib/ai/callAdvisor";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/format";
import { IconPlus } from "@/components/icons";

export default function GoalsPage() {
  const [goals, setGoals] = useState<BusinessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);

  async function refresh() {
    const provider = getDataProvider();
    setGoals(await provider.listGoals());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function getStrategicAdvice() {
    setAdviceLoading(true);
    const result = await callAdvisor(
      "ceo",
      [
        {
          role: "user",
          content:
            "Kijk naar de huidige bedrijfsdoelen en geef drie concrete, haalbare prioriteiten voor de komende twee weken om deze doelen dichterbij te brengen. Baseer je uitsluitend op de meegegeven doelen.",
        },
      ],
      { doelen: goals.map((g) => ({ titel: g.title, huidig: g.metric_current, doel: g.metric_target, eenheid: g.unit })) }
    );
    setAdviceLoading(false);
    setAdvice(result.text);

    const provider = getDataProvider();
    await provider.createAgentRun({
      agent_role: "ceo",
      action: "strategisch_advies",
      permission_tier: 1,
      input: { onderwerp: "prioriteiten bedrijfsdoelen" },
      output: { advies: result.text },
    });
  }

  if (loading) return <div className="text-sm text-ink-muted">Doelen worden geladen…</div>;

  return (
    <div>
      <PageHeader
        title="Bedrijfsdoelen"
        description="Groeidoelen van Oogstweb, met voortgang en strategisch advies van de CEO Agent."
        action={
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <IconPlus className="h-4 w-4" />
            Doel toevoegen
          </button>
        }
      />

      {showForm ? <NewGoalForm onCreated={refresh} onClose={() => setShowForm(false)} /> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {goals.map((goal) => {
          const pct = goal.metric_target ? Math.min(100, Math.round((goal.metric_current / goal.metric_target) * 100)) : 0;
          return (
            <div key={goal.id} className="card p-5">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{goal.title}</h3>
                <span className="badge border border-border bg-surface-elevated text-ink-muted capitalize">{goal.status}</span>
              </div>
              {goal.description ? <p className="mb-3 text-xs text-ink-muted">{goal.description}</p> : null}
              <div className="mb-1.5 flex items-center justify-between text-xs text-ink-muted">
                <span>
                  {goal.metric_current}
                  {goal.unit ? ` ${goal.unit}` : ""} van {goal.metric_target}
                  {goal.unit ? ` ${goal.unit}` : ""}
                </span>
                <span>{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-elevated">
                <div className="h-2 rounded-full bg-positive" style={{ width: `${pct}%` }} />
              </div>
              {goal.deadline ? <p className="mt-2 text-xs text-ink-faint">Deadline: {formatDate(goal.deadline)}</p> : null}
            </div>
          );
        })}
        {goals.length === 0 ? <p className="text-sm text-ink-muted">Nog geen doelen vastgelegd.</p> : null}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold">Strategisch advies (CEO Agent)</h2>
        <button onClick={getStrategicAdvice} disabled={adviceLoading} className="btn-secondary">
          {adviceLoading ? "Analyseren…" : "Prioriteiten voorstellen"}
        </button>
        {advice ? <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface-elevated p-3 text-sm">{advice}</p> : null}
      </div>
    </div>
  );
}

function NewGoalForm({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const provider = getDataProvider();
    await provider.createGoal({ title, metric_target: target ? Number(target) : null, unit: unit || null });
    setSaving(false);
    setTitle("");
    setTarget("");
    setUnit("");
    onCreated();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
      <input className="input sm:col-span-2" placeholder="Doel *" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input type="number" className="input" placeholder="Streefwaarde" value={target} onChange={(e) => setTarget(e.target.value)} />
      <input className="input" placeholder="Eenheid (bijv. EUR/maand)" value={unit} onChange={(e) => setUnit(e.target.value)} />
      <div className="flex gap-2 sm:col-span-4">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Opslaan…" : "Doel opslaan"}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Annuleren
        </button>
      </div>
    </form>
  );
}
