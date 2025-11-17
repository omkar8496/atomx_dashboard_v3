import Link from "next/link";
import {
  AppShell,
  AuthPanel,
  GlobalFooter
} from "@atomx/global-components";
import {
  SectionHeading,
  SharedButton,
  SharedCard
} from "@atomx/shared-ui";
import { getProjectCopy } from "@atomx/lib";
import { formatNumber } from "@atomx/utils";
import { SourceList } from "../components/SourceList";
import {
  getLiveSources,
  getLiveStats
} from "../lib/content";
import { getLiveAlerts } from "../utils/alerts";

export default async function LivelinkDashboard() {
  const [stats, sources] = await Promise.all([
    getLiveStats(),
    getLiveSources()
  ]);
  const alerts = getLiveAlerts();
  const copy = getProjectCopy("livelink");

  return (
    <AppShell
      title="LiveLink Control"
      description={copy.tagline}
      hero={{
        eyebrow: copy.displayName,
        meta: [
          {
            label: "Active Streams",
            value: stats.streams,
            description: "Simultaneous pipelines"
          },
          {
            label: "Global Uptime",
            value: `${stats.uptime}%`,
            description: "Past 30 days"
          },
          {
            label: "Latency",
            value: `${stats.latency}ms`,
            description: "Median end-to-end"
          }
        ]
      }}
    >
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Realtime Control"
          title="Manage every live experience in one place."
          description="Route new sources, pause noisy feeds, and preview what the world sees before going live."
        />

        <SharedCard title="Sources" subtitle="Connected Feeds">
          <SourceList sources={sources} />
        </SharedCard>

        <SharedCard title="Alerts" subtitle="Live Link">
          <ul className="space-y-4">
            {alerts.map((alert) => (
              <li key={alert.message} className="flex items-center justify-between text-sm">
                <span>{alert.message}</span>
                <span className="font-semibold">{alert.value}</span>
              </li>
            ))}
          </ul>
        </SharedCard>

        <div className="rounded-3xl border border-black/5 bg-black p-8 text-white shadow-xl dark:border-white/10">
          <h3 className="text-2xl font-semibold">Need another destination?</h3>
          <p className="mt-2 text-white/70">
            Map LiveLink into any surface with our streaming SDKs.
          </p>
          <Link href="/docs/sdk" className="inline-block">
            <SharedButton className="mt-6 bg-white text-black hover:bg-white/80">
              View SDK docs
            </SharedButton>
          </Link>
        </div>
      </div>

      <aside className="space-y-6">
        <SharedCard title="Performance" subtitle="Realtime KPIs">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt>Audience Reach</dt>
              <dd>{formatNumber(4.2)}M</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Stream Quality</dt>
              <dd>4K HDR</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Regions</dt>
              <dd>12</dd>
            </div>
          </dl>
        </SharedCard>

        <AuthPanel
          title="Authentication"
          description="LiveLink can rely on the shared AtomX auth service or the per-project login form."
          actionLabel="Manage access"
          actionHref="/settings/auth"
        />

        <SharedCard title="Docs" subtitle="Playbooks">
          <p className="text-sm text-black/70 dark:text-white/70">
            Use opinionated playbooks for incident response, approvals, and QA.
          </p>
          <Link href="/playbooks">
            <SharedButton variant="ghost" className="mt-4 px-0">
              Open playbooks
            </SharedButton>
          </Link>
        </SharedCard>
      </aside>

      <div className="lg:col-span-2">
        <GlobalFooter />
      </div>
    </AppShell>
  );
}
