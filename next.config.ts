import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // SW só em produção — em dev atrapalha o hot reload. Teste offline com build+start.
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Evita que um package-lock.json solto no home seja tomado como raiz do workspace
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
