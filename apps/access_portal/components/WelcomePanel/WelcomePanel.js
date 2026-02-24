export function WelcomePanel({ user, actions = [] }) {
  return (
    <section className="mt-1 mb-2 flex flex-col gap-1">
      <div>
        <h1 className="m-0 text-[2rem] font-extrabold leading-tight text-slate-900">
          Welcome {user.name}
        </h1>
        <p className="m-0 pt-1 text-slate-600">
          Choose a module to jump straight into your workspace.
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
