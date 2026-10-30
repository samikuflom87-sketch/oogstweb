export function formatEUR(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function relativeFromNow(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return "vandaag";
  if (diffDays === 1) return "gisteren";
  if (diffDays > 1) return `${diffDays} dagen geleden`;
  if (diffDays === -1) return "morgen";
  return `over ${-diffDays} dagen`;
}
