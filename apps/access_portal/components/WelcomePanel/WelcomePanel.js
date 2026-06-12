export function WelcomePanel({ user, actions = [] }) {
  return (
    <section className="flex flex-col gap-1">
      <div>
        <h1 className="m-0 text-[1.55rem] font-semibold leading-tight text-[#10182b] md:text-[1.75rem]">
          <span className="bg-[linear-gradient(135deg,#e04420,#2f1ec7)] bg-clip-text text-transparent">
            Welcome
          </span>
          , {user.name}!
        </h1>
        <p className="m-0 pt-1 text-[0.88rem] font-normal text-[#58677f]">
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
