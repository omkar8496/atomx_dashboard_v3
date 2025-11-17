export function AnalyticsList({ metrics }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/10"
        >
          <dt className="text-sm text-black/60 dark:text-white/60">
            {metric.label}
          </dt>
          <dd className="text-3xl font-semibold text-black dark:text-white">
            {metric.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
