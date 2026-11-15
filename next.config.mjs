/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // This folder is the whole project, even if a parent folder has its own lockfile or workspace file.
  turbopack: { root: import.meta.dirname },
  outputFileTracingRoot: import.meta.dirname,
  experimental: { serverActions: { bodySizeLimit: '60mb' } },
};
export default nextConfig;
