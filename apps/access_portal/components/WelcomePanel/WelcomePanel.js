export function WelcomePanel({ user, actions = [] }) {
  return (
    <section className="flex flex-col gap-1">
      <div>
        <h1 className="font-chillax m-0 text-[30px] font-semibold leading-[1.06] tracking-[-0.02em] text-(--text) md:text-[38px] lg:text-[44px]">
          <span className="text-(--orange)">Welcome</span>, {user.name}.
        </h1>
        <p className="m-0 pt-2.5 text-[15px] font-light text-(--muted)">
          Choose where you want to continue.
        </p>
      </div>
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <span
              key={action.label}
              className={`rounded-full px-3 py-1 text-sm font-semibold text-white shadow-sm ${
                action.variant === "orange" ? "bg-[#f88c43]" : "bg-[#1495ab]"
              }`}
            >
              {action.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
