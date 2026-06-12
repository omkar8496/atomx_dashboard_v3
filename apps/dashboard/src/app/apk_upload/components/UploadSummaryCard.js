"use client";

export default function UploadSummaryCard() {
  return (
    <div className="relative min-h-[198px] overflow-hidden rounded-lg bg-[#1c1c1c] px-7 py-7 text-white shadow-[0_16px_42px_rgba(28,28,28,0.18)]">
      <div className="absolute bottom-0 right-0 h-28 w-40 rounded-tl-full bg-[#341CD6]/42 blur-xl" aria-hidden />
      <div className="relative">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-[linear-gradient(135deg,#E04420_0%,#A9379E_48%,#341CD6_100%)] text-white shadow-[0_12px_28px_rgba(52,28,214,0.22)]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/64">
          Uploaded
        </p>
        <p className="mt-2 text-[1.82rem] font-normal leading-tight text-white">
          2 builds
        </p>
        <p className="mt-3 max-w-[370px] text-[0.82rem] font-normal leading-6 text-white/62">
          Latest package is ready for rollout. New uploads should be APK files only.
        </p>
      </div>
    </div>
  );
}
