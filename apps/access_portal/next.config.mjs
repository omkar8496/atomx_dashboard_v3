import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

/** @type {import('next').NextConfig} */
const config = {
  reactCompiler: true,
  output: "export",
  images: {
    unoptimized: true
  },
  experimental: {
    externalDir: true
  }
};

export default config;
