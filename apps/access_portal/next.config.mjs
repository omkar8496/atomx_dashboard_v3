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
