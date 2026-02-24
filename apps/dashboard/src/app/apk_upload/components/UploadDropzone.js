"use client";

import React from "react";


const UploadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-12 w-12 text-[#1495ab]"
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
);

export default function UploadDropzone() {
  return (

    <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1495ab]/40 bg-white px-6 py-8 text-center text-slate-700 shadow-sm">
    
      <div className="flex items-center gap-3 text-[#1495ab]">
        <span className="text-xl font-semibold">+</span>
        <span className="text-base font-semibold uppercase tracking-wide">Upload</span>
      </div>
      <div className="mt-6">
        <UploadIcon />
      </div>
      <p className="mt-5 text-base text-slate-600">
        Drag and drop your APK files here
      </p>
      <span className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
        or
      </span>
      <button
        type="button"
        className="mt-4 rounded-full bg-[#1495ab] px-8 py-2 text-sm font-semibold text-white shadow hover:brightness-105"
      >
        Browse Files
      </button>
    </div>
  );
}
