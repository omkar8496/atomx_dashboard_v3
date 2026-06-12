"use client";

import React from "react";

const UploadIcon = () => (
  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#ffe9e4] text-[#E04420]">
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v12" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  </div>
);

export default function UploadDropzone() {
  return (
    <div className="flex min-h-[198px] flex-col items-center justify-center rounded-lg border border-dashed border-[#b8a8ff] bg-[linear-gradient(135deg,#ffffff_0%,#fbfaff_100%)] px-6 py-6 text-center">
      <UploadIcon />
      <p className="mt-5 text-[0.96rem] font-semibold text-[#1f1f1f]">
        Drop APK files here
      </p>
      <p className="mt-2 text-[0.82rem] font-normal text-[#848484]">
        or browse from your device
      </p>
      <button
        type="button"
        className="mt-4 h-10 rounded-lg bg-[#1c1c1c] px-7 text-[0.8rem] font-semibold text-white shadow-[0_10px_22px_rgba(28,28,28,0.13)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E04420]"
      >
        Browse Files
      </button>
    </div>
  );
}
