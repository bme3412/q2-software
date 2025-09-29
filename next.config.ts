import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Explicitly set workspace root to silence lockfile root inference warnings
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
