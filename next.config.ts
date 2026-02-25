import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages deployment
  output: "export",

  // GitHub Pages: https://username.github.io/x-thumbnail-tool
  basePath: "/x-thumbnail-tool",

  trailingSlash: true,

  images: {
    // Required for static export — disables Next.js image optimization
    unoptimized: true,
  },
};

export default nextConfig;
