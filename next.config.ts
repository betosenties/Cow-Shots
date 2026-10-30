import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a self-contained static copy (out/) with relative asset paths
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  ...(isExport ? { output: "export", assetPrefix: ".", images: { unoptimized: true } } : {}),
};

export default nextConfig;
