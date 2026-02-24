"use client";

export default function UploadSummaryCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/20 px-6 py-8 text-center text-white shadow-inner">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">
        Uploaded
      </p>
      <p className="mt-3 text-base text-white/80">No files uploaded yet</p>
    </div>
  );
}
