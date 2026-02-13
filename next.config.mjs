/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  images: {
    unoptimized: true, 
  },
  // We use an empty string instead of './' to satisfy the font loader
  // while still keeping paths relative for Electron.
  assetPrefix: '',
  // This is also helpful for Electron to ensure trailing slashes don't break paths
  trailingSlash: true,
};

export default nextConfig;