import Header from "./components/Header";

export default function Home() {
  const user = {
    name: "Omkar Designer",
    email: "design@atomx.in",
    image: null
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fdf7f2] via-white to-[#eef7fa] pb-10">
      <div className="w-full px-4 pt-6 md:px-8">
        <Header
          eventId="4356"
          eventName="Sunburn"
          pages={["Access Control", "Tag Series", "Inventory"]}
          currentPage="Access Control"
          user={user}
        />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-col gap-6 px-4 md:px-8">
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Dashboard content goes here. Add widgets, charts, and modules as needed.
          </p>
        </section>
      </div>
    </main>
  );
}
