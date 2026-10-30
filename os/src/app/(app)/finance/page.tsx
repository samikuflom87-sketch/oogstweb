"use client";

import { useEffect, useMemo, useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { FinancialEntry, FinancialEntryType, Invoice, Quote } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatDate, formatEUR } from "@/lib/format";
import { IconPlus } from "@/components/icons";

export default function FinancePage() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function refresh() {
    const provider = getDataProvider();
    const [e, q, i] = await Promise.all([provider.listFinancialEntries(), provider.listQuotes(), provider.listInvoices()]);
    setEntries(e);
    setQuotes(q);
    setInvoices(i);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const totals = useMemo(() => {
    const income = entries.filter((e) => e.entry_type === "inkomst").reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter((e) => e.entry_type === "uitgave").reduce((s, e) => s + e.amount, 0);
    const openInvoices = invoices.filter((i) => i.status === "verzonden" || i.status === "te_laat");
    return { income, expense, net: income - expense, openInvoiceTotal: openInvoices.reduce((s, i) => s + i.amount, 0) };
  }, [entries, invoices]);

  if (loading) return <div className="text-sm text-ink-muted">Financiën worden geladen…</div>;

  return (
    <div>
      <PageHeader
        title="Financieel"
        description="Cashflow, offertes en facturen — handmatig bijgehouden, geen verzonnen cijfers."
        action={
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <IconPlus className="h-4 w-4" />
            Boeking toevoegen
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Totale inkomsten" value={formatEUR(totals.income)} />
        <StatCard label="Totale uitgaven" value={formatEUR(totals.expense)} />
        <StatCard label="Netto resultaat" value={formatEUR(totals.net)} trend={totals.net >= 0 ? "up" : "down"} />
        <StatCard label="Openstaand bij facturen" value={formatEUR(totals.openInvoiceTotal)} />
      </div>

      {showForm ? <NewEntryForm onCreated={refresh} onClose={() => setShowForm(false)} /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Transacties</h2>
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <div className="text-sm">{e.description ?? e.category}</div>
                  <div className="text-xs text-ink-faint">
                    {e.category} · {formatDate(e.entry_date)}
                  </div>
                </div>
                <span className={`text-sm font-medium ${e.entry_type === "inkomst" ? "text-positive" : "text-danger"}`}>
                  {e.entry_type === "inkomst" ? "+" : "-"}
                  {formatEUR(e.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">Offertes</h2>
            <div className="space-y-2">
              {quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{q.number}</span>
                  <span className="badge border border-border bg-surface-elevated text-ink-muted capitalize">{q.status}</span>
                  <span className="font-medium">{formatEUR(q.amount)}</span>
                </div>
              ))}
              {quotes.length === 0 ? <p className="text-sm text-ink-muted">Geen offertes.</p> : null}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold">Facturen</h2>
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{inv.number}</span>
                  <span className="badge border border-border bg-surface-elevated text-ink-muted capitalize">{inv.status}</span>
                  <span className="font-medium">{formatEUR(inv.amount)}</span>
                </div>
              ))}
              {invoices.length === 0 ? <p className="text-sm text-ink-muted">Geen facturen.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewEntryForm({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [entryType, setEntryType] = useState<FinancialEntryType>("inkomst");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number(amount);
    if (!category.trim() || !parsed) return;
    setSaving(true);
    const provider = getDataProvider();
    await provider.createFinancialEntry({ entry_type: entryType, category, description: description || null, amount: parsed });
    setSaving(false);
    setCategory("");
    setDescription("");
    setAmount("");
    onCreated();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-5">
      <select className="input" value={entryType} onChange={(e) => setEntryType(e.target.value as FinancialEntryType)}>
        <option value="inkomst">Inkomst</option>
        <option value="uitgave">Uitgave</option>
      </select>
      <input className="input" placeholder="Categorie *" value={category} onChange={(e) => setCategory(e.target.value)} required />
      <input className="input" placeholder="Omschrijving" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input
        type="number"
        step="0.01"
        className="input"
        placeholder="Bedrag (EUR) *"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Opslaan…" : "Opslaan"}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Annuleren
        </button>
      </div>
    </form>
  );
}
