'use client';

export function SharedButton({
  children,
  variant = "solid",
  className = "",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const variants = {
    solid: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black",
    outline:
      "border border-current text-black hover:bg-black/5 dark:text-white dark:hover:bg-white/10",
    ghost:
      "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
  };

  const variantClasses = variants[variant] ?? variants.solid;

  return (
    <button className={`${base} ${variantClasses} ${className}`} {...rest}>
      {children}
    </button>
  );
}
