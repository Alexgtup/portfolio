// next.config.ts
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "15mb" },
  },

  // ВАЖНО: turbopack - на верхнем уровне, не в experimental
  turbopack: {
    root: path.join(process.cwd()), // абсолютный путь к корню проекта
  },
};

export default nextConfig;
