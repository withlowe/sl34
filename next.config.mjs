/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for routes that use client-side APIs
  experimental: {
    // This ensures these routes are always server-rendered and not statically generated
    serverComponentsExternalPackages: ['*'],
  },
  // Disable static generation for specific routes
  unstable_excludeFiles: ['**/index/new/**', '**/index/[id]/edit/**'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
