/** @type {import('next').NextConfig} */
const config = {
  reactCompiler: true,
  output: "export",
  experimental: {
    externalDir: true
  }
};

export default config;
