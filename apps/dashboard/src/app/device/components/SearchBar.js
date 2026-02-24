"use client";

export default function SearchBar() {
  return (
    <div className="w-full">
      <label className="sr-only" htmlFor="device-search">
        Search device
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          id="device-search"
          type="text"
          placeholder="Search Device"
          className="w-full border-0 bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
