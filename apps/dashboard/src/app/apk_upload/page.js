import Header from "../components/Header";
import UploadDropzone from "./components/UploadDropzone";
import UploadSummaryCard from "./components/UploadSummaryCard";
import RecentUploads from "./components/RecentUploads";

export default function ApkUploadPage() {
  return (
    <main className="min-h-screen bg-[color:rgb(var(--color-bg))] pb-10">
      <Header areaLabel="APK Uploads" />

      <div className="w-full pr-4 pl-16 md:pr-8 md:pl-20 mt-6">
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <section className="bg-[color:rgb(var(--color-teal))] px-4 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 md:grid-cols-2">
              <UploadSummaryCard />
              <UploadDropzone />
            </div>
          </section>

          <section className="px-4 py-6 md:px-8 md:py-8">
            <RecentUploads />
          </section>
        </div>
      </div>
    </main>
  );
}
