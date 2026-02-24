import Header from "../components/Header";
import UploadDropzone from "./components/UploadDropzone";
import UploadSummaryCard from "./components/UploadSummaryCard";
import RecentUploads from "./components/RecentUploads";

export default function ApkUploadPage() {
  const user = {
    name: "Omkar Designer",
    email: "design@atomx.in",
    image: null
  };

  return (
    <main className="min-h-screen bg-[#f3f7fb] pb-10">
      <div className="w-full px-4 pt-6 md:px-8">
        <Header
          eventId="4356"
          eventName="Sunburn"
          pages={["Access Control", "Tag Series", "Inventory", "APK Uploads"]}
          currentPage="APK Uploads"
          user={user}
        />
      </div>

      <div className="w-full px-4 md:px-8">
        <div className="mt-6 w-full overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <section className="bg-[#1495ab] px-4 py-6 md:px-8 md:py-8">
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
