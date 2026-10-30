"use client";

import { useEffect, useMemo, useState } from "react";
import { getDataProvider } from "@/lib/data";
import type { Company, WebsiteStatus } from "@/lib/types";
import { callAdvisor } from "@/lib/ai/callAdvisor";
import { PageHeader } from "@/components/PageHeader";
import { formatDate } from "@/lib/format";
import { IconPlus } from "@/components/icons";

const WEBSITE_STATUS_LABEL: Record<string, string> = {
  geen: "Geen website",
  verouderd: "Verouderd",
  matig: "Matig",
  goed: "Goed",
  onbekend: "Onbekend",
};

export default function LeadsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [cityFilter, setCityFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  async function refresh() {
    const provider = getDataProvider();
    const list = await provider.listCompanies({ type: "lead" });
    setCompanies(list);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const cities = useMemo(() => Array.from(new Set(companies.map((c) => c.city).filter(Boolean))) as string[], [companies]);
  const industries = useMemo(
    () => Array.from(new Set(companies.map((c) => c.industry).filter(Boolean))) as string[],
    [companies]
  );

  const filtered = companies.filter((c) => {
    if (cityFilter && c.city !== cityFilter) return false;
    if (industryFilter && c.industry !== industryFilter) return false;
    if (statusFilter && c.website_status !== statusFilter) return false;
    if (search && !`${c.name} ${c.city ?? ""} ${c.industry ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selected = companies.find((c) => c.id === selectedId) ?? null;

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Bedrijven gevonden op plaats, branche en website-status, met onderbouwde kansscore."
        action={
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            <IconPlus className="h-4 w-4" />
            Lead toevoegen
          </button>
        }
      />

      {showForm ? <NewLeadForm onCreated={refresh} onClose={() => setShowForm(false)} /> : null}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="input max-w-[220px]"
          placeholder="Zoek op naam, plaats, branche…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input max-w-[160px]" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
          <option value="">Alle plaatsen</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="input max-w-[180px]" value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
          <option value="">Alle branches</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <select className="input max-w-[180px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Alle website-statussen</option>
          {Object.entries(WEBSITE_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-4 py-3">Bedrijf</th>
                <th className="px-4 py-3">Plaats</th>
                <th className="px-4 py-3">Branche</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Kans­score</th>
                <th className="px-4 py-3">Laatst geverifieerd</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                    Geen leads gevonden met deze filters.
                  </td>
                </tr>
              ) : null}
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-hover"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.city ?? "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{c.industry ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="badge border border-border bg-surface-elevated text-ink-muted">
                      {WEBSITE_STATUS_LABEL[c.website_status ?? "onbekend"]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.opportunity_score !== null ? <ScoreBar score={c.opportunity_score} /> : "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{formatDate(c.last_verified_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <LeadDetail company={selected} onClose={() => setSelectedId(null)} onUpdated={refresh} />
      ) : null}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-positive" : score >= 40 ? "bg-warning" : "bg-danger";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-surface-elevated">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-ink-muted">{score}</span>
    </div>
  );
}

function NewLeadForm({ onCreated, onClose }: { onCreated: () => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>("onbekend");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const provider = getDataProvider();
    await provider.createCompany({
      name,
      city: city || null,
      industry: industry || null,
      website_url: websiteUrl || null,
      website_status: websiteStatus,
      type: "lead",
      source: "Handmatig toegevoegd",
    });
    setSaving(false);
    setName("");
    setCity("");
    setIndustry("");
    setWebsiteUrl("");
    onCreated();
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-5">
      <input className="input" placeholder="Bedrijfsnaam *" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="input" placeholder="Plaats" value={city} onChange={(e) => setCity(e.target.value)} />
      <input className="input" placeholder="Branche" value={industry} onChange={(e) => setIndustry(e.target.value)} />
      <input className="input" placeholder="Website (optioneel)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
      <select className="input" value={websiteStatus} onChange={(e) => setWebsiteStatus(e.target.value as WebsiteStatus)}>
        {Object.entries(WEBSITE_STATUS_LABEL).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
      <div className="flex gap-2 sm:col-span-5">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Opslaan…" : "Lead opslaan"}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost">
          Annuleren
        </button>
      </div>
    </form>
  );
}

function LeadDetail({ company, onClose, onUpdated }: { company: Company; onClose: () => void; onUpdated: () => void }) {
  const [note, setNote] = useState("");
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [score, setScore] = useState(company.opportunity_score ?? 50);

  async function runAnalysis() {
    setAdviceLoading(true);
    const result = await callAdvisor(
      "lead_research",
      [
        {
          role: "user",
          content:
            "Geef op basis van uitsluitend de meegegeven, vastgelegde gegevens een korte onderbouwing van de kansscore en een concrete, specifieke website-aanbeveling voor dit bedrijf. Verzin geen nieuwe feiten, contactgegevens of cijfers die niet zijn meegegeven.",
        },
      ],
      {
        naam: company.name,
        plaats: company.city,
        branche: company.industry,
        huidige_website: company.website_url,
        website_status: company.website_status,
        bestaande_notities: company.notes,
      }
    );
    setAdviceLoading(false);
    setAdvice(result.text);

    const provider = getDataProvider();
    const run = await provider.createAgentRun({
      agent_role: "lead_research",
      action: "scoor_kans",
      permission_tier: 1,
      input: { company_id: company.id },
      output: { advies: result.text, verbonden: result.connected },
      related_company_id: company.id,
    });
    await provider.addInteraction({
      company_id: company.id,
      kind: "systeem",
      content: result.connected ? `AI-analyse (Lead Research Agent): ${result.text}` : result.text,
      agent_run_id: run.id,
    });
    onUpdated();
  }

  async function saveNote() {
    if (!note.trim()) return;
    const provider = getDataProvider();
    await provider.addInteraction({ company_id: company.id, kind: "notitie", content: note });
    setNote("");
    onUpdated();
  }

  async function saveScore() {
    const provider = getDataProvider();
    await provider.updateCompany(company.id, { opportunity_score: score });
    onUpdated();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-base-raised p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{company.name}</h2>
            <p className="text-sm text-ink-muted">
              {company.city ?? "Plaats onbekend"} · {company.industry ?? "Branche onbekend"}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost px-2">
            Sluiten
          </button>
        </div>

        <div className="card mb-4 space-y-2 p-4 text-sm">
          <Row label="Website" value={company.website_url ?? "Geen website bekend"} />
          <Row label="Website-status" value={WEBSITE_STATUS_LABEL[company.website_status ?? "onbekend"]} />
          <Row label="Telefoon" value={company.phone ?? "Onbekend"} />
          <Row label="E-mail" value={company.email ?? "Onbekend"} />
          <Row label="KvK" value={company.kvk_verified ? `${company.kvk_number} (geverifieerd)` : "Niet geverifieerd"} />
          <Row label="Bron" value={company.source ?? "Onbekend"} />
          <Row label="Laatst geverifieerd" value={formatDate(company.last_verified_at)} />
        </div>

        <div className="card mb-4 p-4">
          <div className="label-xs mb-2">Kansscore (handmatige inschatting)</div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-10 text-right text-sm font-medium">{score}</span>
          </div>
          <button onClick={saveScore} className="btn-secondary mt-3">
            Score opslaan
          </button>
        </div>

        <div className="card mb-4 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">AI-analyse (Lead Research Agent — tier 1, automatisch)</h3>
          </div>
          <p className="mb-3 text-xs text-ink-muted">
            Analyseert alleen de hiernaast vastgelegde gegevens. Vindt geen nieuwe bedrijven of contactgegevens op
            internet — daarvoor is nog geen zoek/KvK-integratie verbonden.
          </p>
          <button onClick={runAnalysis} disabled={adviceLoading} className="btn-secondary">
            {adviceLoading ? "Analyseren…" : "AI-analyse genereren"}
          </button>
          {advice ? <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface-elevated p-3 text-sm">{advice}</p> : null}
        </div>

        {company.website_recommendation ? (
          <div className="card mb-4 p-4">
            <h3 className="mb-1 text-sm font-semibold">Website-aanbeveling</h3>
            <p className="text-sm text-ink-muted">{company.website_recommendation}</p>
          </div>
        ) : null}

        <div className="card p-4">
          <h3 className="mb-2 text-sm font-semibold">Notitie toevoegen</h3>
          <textarea
            className="input mb-2 min-h-[80px]"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bijv. telefonisch contact gehad, interesse getoond in webshop…"
          />
          <button onClick={saveNote} className="btn-secondary">
            Notitie opslaan
          </button>
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
