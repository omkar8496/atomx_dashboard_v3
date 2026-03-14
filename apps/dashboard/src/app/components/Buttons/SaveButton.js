"use client";

export default function SaveButton({
  label = "Save Changes",
  onClick,
  disabled = false,
  className = ""
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full bg-[color:rgb(var(--color-orange))] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgb(var(--color-orange)/0.35)] transition hover:bg-[#f57f2f] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {label}
    </button>
  );
}
