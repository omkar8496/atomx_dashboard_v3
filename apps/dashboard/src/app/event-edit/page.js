import Header from "../components/Header";
import EventEditContent from "./components/EventEditContent";

export default function EventEditPage() {
  return (
    <main
      className="event-edit-page-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX Event Edit Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX Event Edit Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Event Edit Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX Event Edit Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .event-edit-page-font,
        .event-edit-page-font * {
          font-family: "AtomX Event Edit Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="Edit Event" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
        <EventEditContent />
      </div>
    </main>
  );
}
