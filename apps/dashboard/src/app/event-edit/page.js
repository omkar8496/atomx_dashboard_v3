import Header from "../components/Header";
import EventEditContent from "./components/EventEditContent";

export default function EventEditPage() {
  return (
    <main
      className="min-h-screen w-full max-w-full overflow-x-hidden bg-(--bg) pb-10"
      style={{ fontFamily: '"Poppins", system-ui, sans-serif' }}
    >
      <style>{`
        @media (max-width: 900px) {
          html,
          body {
            overflow-x: hidden;
          }
        }
      `}</style>
      <Header areaLabel="Edit Event" variant="portal" />

      <div className="mx-auto w-full max-w-[1780px] overflow-x-hidden pr-4 pl-[72px] pt-6 md:pr-7 md:pl-[88px] max-[900px]:px-3 max-[900px]:pt-4">
        <EventEditContent />
      </div>
    </main>
  );
}
