"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  IconAdvisor,
  IconAgents,
  IconClose,
  IconCrm,
  IconDashboard,
  IconFinance,
  IconGoals,
  IconLeads,
  IconLogout,
  IconMenu,
  IconTasks,
} from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { href: "/leads", label: "Leads", icon: IconLeads },
  { href: "/crm", label: "CRM", icon: IconCrm },
  { href: "/agents", label: "AI Agents", icon: IconAgents },
  { href: "/advisor", label: "Adviseur", icon: IconAdvisor },
  { href: "/tasks", label: "Taken & agenda", icon: IconTasks },
  { href: "/finance", label: "Financieel", icon: IconFinance },
  { href: "/goals", label: "Doelen", icon: IconGoals },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, mode, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-accent/15 text-ink" : "text-ink-muted hover:bg-surface-hover hover:text-ink"
            }`}
          >
            <Icon className={`h-[18px] w-[18px] ${active ? "text-accent" : ""}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-base-raised py-5 lg:flex">
        <div className="mb-6 flex items-center gap-2.5 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-elevated text-sm font-semibold text-accent">
            O
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Oogstweb OS</div>
            <div className="label-xs leading-tight">{mode === "demo" ? "Demo-modus" : "Live"}</div>
          </div>
        </div>
        {nav}
        <div className="mt-auto space-y-2 px-3 pt-4">
          <div className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <div className="text-xs text-ink-muted">Ingelogd als</div>
            <div className="truncate text-sm font-medium">{user?.email}</div>
          </div>
          <button onClick={handleSignOut} className="btn-ghost w-full justify-start">
            <IconLogout className="h-[18px] w-[18px]" />
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-base-raised px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-sm font-semibold text-accent">
              O
            </div>
            <span className="text-sm font-semibold">Oogstweb OS</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="btn-ghost px-2">
            <IconMenu className="h-5 w-5" />
          </button>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <div className="relative flex w-72 flex-col bg-base-raised py-5">
              <div className="mb-6 flex items-center justify-between px-4">
                <span className="text-sm font-semibold">Oogstweb OS</span>
                <button onClick={() => setMobileOpen(false)} className="btn-ghost px-2">
                  <IconClose className="h-5 w-5" />
                </button>
              </div>
              {nav}
              <div className="mt-auto px-3 pt-4">
                <button onClick={handleSignOut} className="btn-ghost w-full justify-start">
                  <IconLogout className="h-[18px] w-[18px]" />
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
