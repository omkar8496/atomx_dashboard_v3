"use client";

export default function SessionPrompt({
  open,
  title,
  message,
  countdown,
  actionLabel = "Re-login",
  onAction,
  onClose,
  allowDismiss = true
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-xl border border-[#f2d9c8] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {message}
              {countdown ? (
                <span className="ml-1 text-slate-800 font-semibold">{countdown}</span>
              ) : null}
            </p>
          </div>
          {allowDismiss ? (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Close"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onAction}
            className="rounded-md bg-[color:rgb(var(--color-orange))] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_12px_rgb(var(--color-orange)/0.25)]"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
