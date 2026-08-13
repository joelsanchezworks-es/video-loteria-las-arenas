/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lint is available via `npm run lint`, but we don't want a lint warning to
  // block a production build (the app uses a lot of Spanish UI copy). Types are
  // still fully checked during the build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
