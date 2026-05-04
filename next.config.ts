import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/sitemap.xml": ["./data/skills-index.json"],
    "/sitemap/*": ["./data/skills-index.json"],
  },
};

export default nextConfig;
