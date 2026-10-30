"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDataProvider } from "@/lib/data";
import type { Company, Contact, Interaction, InteractionKind, Invoice, Project, Quote } from "@/lib/types";
import { formatDateTime, formatEUR } from "@/lib/format";

const KIND_LABEL: Record<InteractionKind, string> = {
  notitie: "Notitie",
  email: "E-mail",
  telefoon: "Telefoon",
  vergadering: "Vergadering",
  systeem: "Systeem",
};

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<InteractionKind>("notitie");

  async function refresh() {
    const provider = getDataProvider();
    const [c, ct, ints, allProjects, allQuotes, allInvoices] = await Promise.all([
      provider.getCompany(params.id),
      provider.listContacts(params.id),
      provider.listInteractions(params.id),
      provider.listProjects(),
      provider.listQuotes(),
      provider.listInvoices(),
    ]);
    setCompany(c);
    setContacts(ct);
    setInteractions(ints);
    setProjects(allProjects.filter((p) => p.company_id === params.id));
    setQuotes(allQuotes.filter((q) => q.company_id === params.id));
    setInvoices(allInvoices.filter((i) => i.company_id === params.id));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function addNote() {
    if (!note.trim()) return;
    const provider = getDataProvider();
    await provider.addInteraction({ company_id: params.id, kind, content: note });
    setNote("");
    refresh();
  }

  if (loading) return <div className="text-sm text-ink-muted">Bedrijf wordt geladen…</div>;
  if (!company) return <div className="text-sm text-ink-muted">Bedrijf niet gevonden.</div>;

  return (
    <div>
      <button onClick={() => router.push("/crm")} className="btn-ghost mb-4 px-0">
        ← Terug naar pijplijn
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {company.city ?? "Plaats onbekend"} · {company.industry ?? "Branche onbekend"} ·{" "}
            <span className="capitalize">{company.pipeline_stage}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card space-y-2 p-4 text-sm lg:col-span-1">
          <h2 className="mb-2 text-sm font-semibold">Gegevens</h2>
          <Row label="Website" value={company.website_url ?? "—"} />
          <Row label="Telefoon" value={company.phone ?? "—"} />
          <Row label="E-mail" value={company.email ?? "—"} />
          <Row label="KvK" value={company.kvk_number ?? "—"} />

          <h2 className="mb-2 mt-4 text-sm font-semibold">Contacten</h2>
          {contacts.length === 0 ? <p className="text-ink-faint">Geen contacten vastgelegd.</p> : null}
          {contacts.map((ct) => (
            <div key={ct.id} className="rounded-lg border border-border px-3 py-2">
              <div className="font-medium">{ct.name}</div>
              <div className="text-xs text-ink-muted">{ct.role_title ?? "—"}</div>
            </div>
          ))}

          {projects.length > 0 ? (
            <>
              <h2 className="mb-2 mt-4 text-sm font-semibold">Projecten</h2>
              {projects.map((p) => (
                <div key={p.id} className="rounded-lg border border-border px-3 py-2">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-ink-muted capitalize">{p.status}</div>
                </div>
              ))}
            </>
          ) : null}

          {(quotes.length > 0 || invoices.length > 0) ? (
            <>
              <h2 className="mb-2 mt-4 text-sm font-semibold">Offertes &amp; facturen</h2>
              {quotes.map((q) => (
                <div key={q.id} className="flex justify-between rounded-lg border border-border px-3 py-2">
                  <span>Offerte {q.number}</span>
                  <span className="text-ink-muted">{formatEUR(q.amount)}</span>
                </div>
              ))}
              {invoices.map((i) => (
                <div key={i.id} className="flex justify-between rounded-lg border border-border px-3 py-2">
                  <span>Factuur {i.number}</span>
                  <span className="text-ink-muted">{formatEUR(i.amount)}</span>
                </div>
              ))}
            </>
          ) : null}
        </div>

        <div className="card p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Volledige geschiedenis</h2>

          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <select className="input max-w-[160px]" value={kind} onChange={(e) => setKind(e.target.value as InteractionKind)}>
              {Object.entries(KIND_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <input
              className="input flex-1"
              placeholder="Nieuwe interactie toevoegen…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button onClick={addNote} className="btn-secondary">
              Toevoegen
            </button>
          </div>

          <div className="space-y-3">
            {interactions.length === 0 ? <p className="text-sm text-ink-muted">Nog geen geschiedenis.</p> : null}
            {interactions.map((i) => (
              <div key={i.id} className="flex gap-3 border-b border-border/60 pb-3 last:border-0">
                <span className="badge mt-0.5 h-fit border border-border bg-surface-elevated text-ink-muted">
                  {KIND_LABEL[i.kind]}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{i.content}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {formatDateTime(i.created_at)} {i.created_by ? `· ${i.created_by}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-ink-faint">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}
