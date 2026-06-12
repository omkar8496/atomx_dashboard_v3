"use client";

const uploads = [
  {
    id: 1,
    name: "app-release-v1.2.3.apk",
    meta: "Uploaded 2 hours ago • 25.4 MB",
    status: "Success"
  },
  {
    id: 2,
    name: "app-debug-v1.2.2.apk",
    meta: "Uploaded 1 day ago • 28.1 MB",
    status: "Success"
  }
];

const FileIcon = () => (
  <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#ffe9e4] text-[#E04420]">
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  </div>
);

const UploadEmptyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-7 w-7"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 16V4" />
    <path d="m7 9 5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);

export default function RecentUploads() {
  return (
    <section className="mt-5 rounded-xl border border-[#ded4ff] border-l-[4px] border-l-[#E04420] bg-white p-5 shadow-[0_22px_65px_rgba(15,23,42,0.10)]">
      <div className="flex flex-col gap-2 border-b border-[#e5e5e5] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.76rem] font-bold uppercase tracking-[0.24em] text-[#E04420]">
            Recent Uploads
          </p>
          <h2 className="mt-1 text-[1.32rem] font-bold leading-none text-[#1c1c1c]">
            2 listed
          </h2>
        </div>
        <p className="text-[0.9rem] font-medium text-[#8f8f8f]">
          Signed packages and debug builds
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {uploads.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
          >
            <div className="flex min-w-0 items-center gap-4">
              <FileIcon />
              <div className="min-w-0">
                <p className="truncate text-[1rem] font-semibold text-[#1f1f1f]">{item.name}</p>
                <p className="text-[0.86rem] font-medium text-[#657391]">{item.meta}</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#e4f6ff] px-4 py-2 text-[0.78rem] font-bold text-[#0285bf]">
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-2 pb-3 text-[#8b96aa]">
        <UploadEmptyIcon />
        <p className="text-[0.9rem] font-medium">No more uploads to show</p>
      </div>
    </section>
  );
}
