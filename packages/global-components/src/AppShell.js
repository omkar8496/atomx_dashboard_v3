import { SharedCard } from "@atomx/shared-ui";

export function AppShell({ title, description, hero, children }) {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-black dark:bg-black dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white/90 p-8 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-black/40 dark:text-white/60">
                {hero?.eyebrow ?? "ATOMX PLATFORM"}
              </p>
              <h1 className="text-4xl font-semibold">{title}</h1>
              <p className="mt-2 text-base text-black/70 dark:text-white/70">
                {description}
              </p>
            </div>
            {hero?.cta}
          </div>
          {hero?.meta && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hero.meta.map((item) => (
                <SharedCard key={item.label} title={item.value} subtitle={item.label}>
                  {item.description}
                </SharedCard>
              ))}
            </div>
          )}
        </header>
        <main className="grid gap-6 lg:grid-cols-[2fr,1fr]">{children}</main>
      </div>
    </div>
  );
}
