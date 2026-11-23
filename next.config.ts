import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  outputFileTracingIncludes: {
    "/": ["./prisma/dev.db"],
  },
};

export default nextConfig;
