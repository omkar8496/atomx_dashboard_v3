import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

// Hosting the export under a sub-path (e.g. /access_portal on a shared bucket)
// requires basePath + assetPrefix; leave the env var unset for a domain root.
const basePathEnv = process.env.NEXT_PUBLIC_ACCESS_PORTAL_BASEPATH ?? "/";
const basePath = basePathEnv === "/" ? "" : basePathEnv;

/** @type {import('next').NextConfig} */
const config = {
  reactCompiler: true,
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true
  },
  transpilePackages: [
    "@atomx/shared-ui",
    "@atomx/global-components",
    "@atomx/lib"
  ],
  experimental: {
    externalDir: true
  }
};

export default config;
