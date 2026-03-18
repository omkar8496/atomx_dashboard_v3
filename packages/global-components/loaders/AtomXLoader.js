"use client";

export function AtomXLoader({
  label = "Loading...",
  size = 72,
  fullScreen = false,
  className = ""
}) {
  const wrapperClasses = fullScreen
    ? "flex min-h-screen w-full items-center justify-center"
    : "flex w-full items-center justify-center py-6";

  return (
    <div className={`${wrapperClasses} ${className}`.trim()}>
      <div className="flex flex-col items-center gap-3">
        <img
          src="/shared/logos/loader/loader_01.gif"
          alt="Loading"
          style={{ width: `${size}px`, height: `${size}px` }}
          className="object-contain"
        />
        {label ? (
          <p className="m-0 text-sm font-medium text-slate-600">{label}</p>
        ) : null}
      </div>
    </div>
  );
}
