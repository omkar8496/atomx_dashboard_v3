import Header from "../components/Header";
import UploadDropzone from "./components/UploadDropzone";
import UploadSummaryCard from "./components/UploadSummaryCard";
import RecentUploads from "./components/RecentUploads";

export default function ApkUploadPage() {
  return (
    <main
      className="apk-upload-font min-h-screen bg-[color:rgb(var(--color-bg))] pb-10"
      style={{ fontFamily: '"AtomX APK Poppins", Poppins, sans-serif' }}
    >
      <style>{`
        @font-face {
          font-family: "AtomX APK Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Regular.ttf") format("truetype");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX APK Poppins";
          src: url("/shared/fonts/Poppins/Poppins-SemiBold.ttf") format("truetype");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "AtomX APK Poppins";
          src: url("/shared/fonts/Poppins/Poppins-Bold.ttf") format("truetype");
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }
        .apk-upload-font,
        .apk-upload-font * {
          font-family: "AtomX APK Poppins", Poppins, sans-serif;
        }
      `}</style>
      <Header areaLabel="APK Uploads" variant="portal" />

      <div className="w-full pr-4 pl-[72px] pt-5 md:pr-7 md:pl-[88px]">
        <section className="mb-4 flex flex-col gap-4 border-b border-[#d8d8d8] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[1.75rem] font-semibold leading-none text-[#111827] md:text-[1.9rem]">
              APK Uploads
            </h1>
            <p className="mt-3 text-[0.9rem] font-normal text-[#777777]">
              Upload Android builds and track recent release packages.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-3 rounded-lg bg-[#1c1c1c] px-5 text-[0.86rem] font-semibold text-white shadow-[0_12px_26px_rgba(28,28,28,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E04420]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v12" />
              <path d="m7 9 5-5 5 5" />
              <path d="M5 20h14" />
            </svg>
            Upload APK
          </button>
        </section>

        <section className="rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-3 shadow-[0_18px_52px_rgba(15,23,42,0.09)] md:p-4">
          <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
            <UploadSummaryCard />
            <UploadDropzone />
          </div>
        </section>

        <RecentUploads />
      </div>
    </main>
  );
}
