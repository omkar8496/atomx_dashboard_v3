export function SourceList({ sources }) {
  return (
    <ul className="flex flex-col gap-3">
      {sources.map((source) => (
        <li
          key={source.id}
          className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-white/10"
        >
          <span>{source.label}</span>
          <span
            className={`text-xs uppercase tracking-wide ${
              source.active
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-orange-500"
            }`}
          >
            {source.active ? "Active" : "Paused"}
          </span>
        </li>
      ))}
    </ul>
  );
}
