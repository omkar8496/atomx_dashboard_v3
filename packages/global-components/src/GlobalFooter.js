import Link from "next/link";

export function GlobalFooter() {
  return (
    <footer className="rounded-3xl border border-black/5 bg-white/80 p-6 text-sm text-black/70 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} AtomX Platform</p>
        <nav className="flex gap-4 text-black/60 dark:text-white/60">
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="mailto:support@atomx.example">Support</Link>
        </nav>
      </div>
    </footer>
  );
}
