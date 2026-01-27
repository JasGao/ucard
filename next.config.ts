import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Turbopack uses this project directory as root,
    // even if other lockfiles exist higher in the filesystem.
    root: __dirname,
  },
};

export default nextConfig;
