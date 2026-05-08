import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    // Required for static exports: Next.js Image Optimization server is
    // unavailable in a static build. ESRI tiles are fetched directly by
    // the browser, so skipping server-side optimisation has no impact.
    unoptimized: true,
  },
};

export default nextConfig;
