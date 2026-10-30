"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDataProvider } from "@/lib/data";
import type { Company, PipelineStage } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";

const STAGES: { key: PipelineStage; label: string }[] = [
  { key: "nieuw", label: "Nieuw" },
  { key: "gecontacteerd", label: "Gecontacteerd" },
  { key: "offerte", label: "Offerte" },
  { key: "klant", label: "Klant" },
  { key: "verloren", label: "Verloren" },
];

export default function CrmPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const provider = getDataProvider();
    const list = await provider.listCompanies();
    setCompanies(list.filter((c) => c.type !== "archived"));
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function moveStage(company: Company, stage: PipelineStage) {
    const provider = getDataProvider();
    await provider.updateCompany(company.id, {
      pipeline_stage: stage,
      type: stage === "klant" ? "client" : company.type,
    });
    refresh();
  }

  if (loading) return <div className="text-sm text-ink-muted">Pijplijn wordt geladen…</div>;

  return (
    <div>
      <PageHeader title="CRM" description="Volledige pijplijn van eerste contact tot klant, met klantgeschiedenis." />

      <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const items = companies.filter((c) => c.pipeline_stage === stage.key);
          return (
            <div key={stage.key} className="min-w-[220px]">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <span className="text-xs text-ink-faint">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((c) => (
                  <div key={c.id} className="card-interactive p-3">
                    <Link href={`/crm/${c.id}`} className="block">
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-ink-muted">{c.city ?? "—"}</div>
                    </Link>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {STAGES.filter((s) => s.key !== stage.key).map((s) => (
                        <button
                          key={s.key}
                          onClick={() => moveStage(c, s.key)}
                          className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-ink-muted hover:bg-surface-hover hover:text-ink"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 ? <p className="px-1 text-xs text-ink-faint">Geen bedrijven</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
