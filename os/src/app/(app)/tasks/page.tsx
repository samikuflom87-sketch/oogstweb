"use client";

import { useEffect, useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { Appointment, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { formatDate, formatDateTime } from "@/lib/format";
import { IconPlus } from "@/components/icons";

const STATUS_LABEL: Record<TaskStatus, string> = { open: "Open", in_uitvoering: "In uitvoering", klaar: "Klaar" };
const PRIORITY_LABEL: Record<TaskPriority, string> = { laag: "Laag", normaal: "Normaal", hoog: "Hoog" };
const PRIORITY_COLOR: Record<TaskPriority, string> = {
  laag: "border-border bg-surface-elevated text-ink-muted",
  normaal: "border-accent/30 bg-accent/10 text-accent",
  hoog: "border-danger/30 bg-danger/10 text-danger",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    const provider = getDataProvider();
    const [t, a] = await Promise.all([provider.listTasks(), provider.listAppointments()]);
    setTasks(t);
    setAppointments(a);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function cycleStatus(task: Task) {
    const order: TaskStatus[] = ["open", "in_uitvoering", "klaar"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    const provider = getDataProvider();
    await provider.updateTask(task.id, { status: next });
    refresh();
  }

  if (loading) return <div className="text-sm text-ink-muted">Taken worden geladen…</div>;

  return (
    <div>
      <PageHeader
        title="Taken & agenda"
        description="Werk, afspraken en opvolging op één plek."
        action={
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <IconPlus className="h-4 w-4" />
            Taak toevoegen
          </button>
        }
      />

      {showForm ? <NewTaskForm onCreated={refresh} onClose={() => setShowForm(false)} /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Taken</h2>
          <div className="space-y-2">
            {tasks.length === 0 ? <p className="text-sm text-ink-muted">Nog geen taken.</p> : null}
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
                <div>
                  <button onClick={() => cycleStatus(t)} className="text-sm font-medium hover:underline">
                    {t.title}
                  </button>
                  {t.description ? <p className="text-xs text-ink-muted">{t.description}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge border ${PRIORITY_COLOR[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span>
                  <span className="text-xs text-ink-faint">{formatDate(t.due_date)}</span>
                  <button
                    onClick={() => cycleStatus(t)}
                    className="rounded-md border border-border px-2 py-1 text-[11px] text-ink-muted hover:bg-surface-hover"
                  >
                    {STATUS_LABEL[t.status]}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Afspraken</h2>
          <div className="space-y-2">
            {appointments.length === 0 ? <p className="text-sm text-ink-muted">Geen geplande afspraken.</p> : null}
            {appointments.map((a) => (
              <div key={a.id} className="rounded-lg border border-border px-3 py-2.5">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-ink-muted">{formatDateTime(a.start_at)}</div>
                {a.location ? <div className="text-xs text-ink-faint">{a.location}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewTaskForm({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normaal");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const provider = getDataProvider();
    await provider.createTask({ title, due_date: dueDate || null, priority });
    setSaving(false);
    setTitle("");
    setDueDate("");
    onCreated();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
      <input className="input sm:col-span-2" placeholder="Taak *" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
        {Object.entries(PRIORITY_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-4">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Opslaan…" : "Taak opslaan"}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Annuleren
        </button>
      </div>
    </form>
  );
}
