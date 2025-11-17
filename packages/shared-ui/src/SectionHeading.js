export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="space-y-2">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/60">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold text-black dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="text-base text-black/70 dark:text-white/70">
          {description}
        </p>
      )}
    </div>
  );
}
