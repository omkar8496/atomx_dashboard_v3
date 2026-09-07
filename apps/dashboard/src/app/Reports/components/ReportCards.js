"use client";

import { getReportSections } from "./reportCatalogue";

function DownloadIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

const GROUP_THEMES = {
  summary: "linear-gradient(140deg,#e04420,#8b5cf6)",
  dumps: "linear-gradient(140deg,#00a9f2,#341cd6)",
  analytics: "linear-gradient(140deg,#8b5cf6,#341cd6)",
  other: "linear-gradient(140deg,#e04420,#e08a20)"
};

export default function ReportCards({ role, onSelectReport }) {
  const sections = getReportSections(role);

  if (sections.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-(--line) bg-(--surface) px-5 py-10 text-center">
        <div className="font-chillax text-[17px] font-medium text-(--text)">No reports available</div>
        <div className="mt-1.5 text-[12.5px] text-(--faint)">
          Your role does not have access to any report type.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[clamp(18px,2.4vw,26px)]">
      {sections.map((section) => (
        <section key={section.id}>
          <div className="mb-3 flex items-center gap-2.5">
            <span
              className="font-vcr grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-[11px] text-white"
              style={{ background: GROUP_THEMES[section.id] ?? GROUP_THEMES.summary }}
            >
              {String(section.reports.length).padStart(2, "0")}
            </span>
            <h2 className="font-chillax m-0 text-[17px] font-semibold tracking-[-0.01em] text-(--text)">
              {section.label}
            </h2>
            <span className="font-vcr text-[8.5px] uppercase tracking-[0.16em] text-(--faint)">
              {section.hint}
            </span>
            <span className="h-px flex-1 bg-(--line2)" aria-hidden />
          </div>

          <div
            className="grid gap-[clamp(12px,1.2vw,16px)]"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))" }}
          >
            {section.reports.map((report) => (
              <article
                key={report.type}
                className="flex flex-col rounded-[14px] border border-(--line) bg-(--surface) p-4 shadow-(--shadow) transition duration-200 hover:border-(--orange) hover:shadow-(--shadowUp)"
              >
                <h3 className="font-chillax m-0 text-[14.5px] font-semibold leading-[1.25] tracking-[-0.01em] text-(--text)">
                  {report.name}
                </h3>
                <p className="font-vcr mt-1 text-[8.5px] uppercase tracking-[0.14em] text-(--faint)">
                  {report.type}
                </p>
                <p className="mt-2.5 border-t border-(--line2) pt-2.5 text-[12.5px] font-light leading-[1.5] text-(--muted)">
                  {report.description}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectReport(report.type)}
                  className="mt-3.5 inline-flex h-9 w-fit cursor-pointer items-center gap-2 rounded-[9px] border border-(--line) bg-(--surface) px-3 text-[12.5px] font-semibold text-(--text) transition hover:border-(--orange) hover:bg-[rgba(224,68,32,0.06)] hover:text-(--orange)"
                >
                  <DownloadIcon />
                  Download Report
                </button>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
