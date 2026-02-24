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
  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e2f7fb] text-[#1495ab]">
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="M8 8l4-4 4 4" />
      <rect x="4" y="16" width="16" height="6" rx="2" />
    </svg>
  </div>
);

export default function RecentUploads() {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-slate-800">Recent Uploads</h2>
      <div className="mt-4 space-y-4">
        {uploads.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100"
          >
            <div className="flex items-center gap-4">
              <FileIcon />
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-500">{item.meta}</p>
              </div>
            </div>
            <span className="rounded-full bg-[#e5fbe8] px-3 py-1 text-xs font-semibold text-[#1f7a3d]">
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-center gap-2 text-slate-400">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V4" />
          <path d="M8 8l4-4 4 4" />
          <rect x="4" y="16" width="16" height="6" rx="2" />
        </svg>
        <p className="text-sm">No more uploads to show</p>
      </div>
    </div>
  );
}
