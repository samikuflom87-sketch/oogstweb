export function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "flat";
}) {
  const trendColor = trend === "up" ? "text-positive" : trend === "down" ? "text-danger" : "text-ink-faint";
  return (
    <div className="card p-5">
      <div className="label-xs">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {sub ? <div className={`mt-1.5 text-xs ${trendColor}`}>{sub}</div> : null}
    </div>
  );
}
