import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

/** @type {import('next').NextConfig} */
const basePathEnv = process.env.NEXT_PUBLIC_DASHBOARD_BASEPATH ?? "/dashboard";
const basePath = basePathEnv === "/" ? "" : basePathEnv;

const nextConfig = {
  reactCompiler: true,
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
