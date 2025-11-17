import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = path.join(packageRoot, "assets");
const fontRoot = path.join(packageRoot, "fonts");
const logoRoot = path.join(packageRoot, "logos");

export const assetManifest = [
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg"
];

export const fontManifest = [
  { file: "Poppins-Thin.ttf", weight: 100, style: "normal" },
  { file: "Poppins-Light.ttf", weight: 300, style: "normal" },
  { file: "Poppins-Regular.ttf", weight: 400, style: "normal" },
  { file: "Poppins-MediumItalic.ttf", weight: 500, style: "italic" },
  { file: "Poppins-SemiBold.ttf", weight: 600, style: "normal" },
  { file: "Poppins-Bold.ttf", weight: 700, style: "normal" }
];

export const sharedLogoFile = "AtomX_Logo.svg";
export const sharedLogoPublicPath = `/shared/logos/${sharedLogoFile}`;

export function getAssetPath(asset) {
  if (!assetManifest.includes(asset)) {
    throw new Error(`Unknown shared asset: ${asset}`);
  }

  return path.join(assetRoot, asset);
}

export function getFontPath(fontFile) {
  const match = fontManifest.find((font) => font.file === fontFile);
  if (!match) {
    throw new Error(`Unknown Poppins font: ${fontFile}`);
  }
  return {
    filePath: path.join(fontRoot, fontFile),
    meta: match
  };
}

export function getFontPublicPath(fontFile) {
  const match = fontManifest.find((font) => font.file === fontFile);
  if (!match) {
    throw new Error(`Unknown Poppins font: ${fontFile}`);
  }
  return {
    href: `/shared/fonts/${fontFile}`,
    meta: match
  };
}

export function getLogoPath() {
  return path.join(logoRoot, sharedLogoFile);
}

export function getLogoPublicPath() {
  return sharedLogoPublicPath;
}
