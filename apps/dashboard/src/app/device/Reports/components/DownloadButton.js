"use client";

export default function DownloadButton() {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        className="mt-4 flex items-center gap-3 rounded-2xl bg-[color:rgb(var(--color-teal))] px-8 py-3 text-base font-semibold text-white shadow-[0_16px_32px_rgb(var(--color-teal)/0.35)] transition hover:brightness-105"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v12" />
          <path d="M8 11l4 4 4-4" />
          <rect x="4" y="17" width="16" height="4" rx="2" />
        </svg>
        Download
      </button>
    </div>
  );
}
