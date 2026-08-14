import Header from "../components/Header";

export default function PatchaNyTrackPage() {
  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10 font-[Poppins,sans-serif]">
      <Header areaLabel="Patcha-NY-Track" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px] max-[900px]:px-3 max-[640px]:pt-4">
        <section className="border-b border-[#d8d8d8] pb-4">
          <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem] max-[640px]:text-[1.25rem]">
            Patcha-NY-Track
          </h1>
        </section>
      </div>
    </main>
  );
}
