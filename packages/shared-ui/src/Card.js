export function SharedCard({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <header className="mb-4 space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50 dark:text-white/60">
          {subtitle}
        </p>
        <h2 className="text-2xl font-semibold text-black dark:text-white">
          {title}
        </h2>
      </header>
      <div className="text-sm text-black/70 dark:text-white/80">{children}</div>
    </section>
  );
}
