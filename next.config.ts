import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-e8add125590343a2b2abc50dc4f20555.r2.dev",
      },
    ],
  },
};

export default nextConfig;
