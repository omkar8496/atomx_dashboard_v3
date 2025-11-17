/** @type {import('next').NextConfig} */
const config = {
  reactCompiler: true,
  transpilePackages: [
    "@atomx/shared-ui",
    "@atomx/global-components",
    "@atomx/auth",
    "@atomx/api-client",
    "@atomx/lib",
    "@atomx/utils"
  ],
  experimental: {
    externalDir: true
  }
};

export default config;
