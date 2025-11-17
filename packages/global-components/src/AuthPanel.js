import Link from "next/link";
import { SharedButton, SharedCard } from "@atomx/shared-ui";

export function AuthPanel({ title, description, actionLabel, actionHref = "/auth" }) {
  return (
    <SharedCard title={title} subtitle="Authentication">
      <p className="mb-4 text-sm text-black/70 dark:text-white/70">
        {description}
      </p>
      <Link href={actionHref}>
        <SharedButton className="w-full">{actionLabel}</SharedButton>
      </Link>
    </SharedCard>
  );
}
