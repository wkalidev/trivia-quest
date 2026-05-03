import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Compression gzip/brotli — réduit la taille des chunks JS
  compress: true,

  // ✅ Headers sécurité + performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ✅ Autorise l'embedding dans Farcaster / MiniPay iframes
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *;",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // ✅ Préconnexion aux origines critiques via Early Hints
          {
            key: "Link",
            value: [
              "<https://forno.celo.org>; rel=preconnect",
              "<https://api.geckoterminal.com>; rel=preconnect",
              "<https://api.web3modal.org>; rel=preconnect",
            ].join(", "),
          },
        ],
      },
      // ✅ Cache long pour les assets statiques (chunks JS/CSS hashés)
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }: { isServer: boolean }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
      ...(isServer && { indexedDB: false }),
    };
    return config;
  },
};

export default withNextIntl(nextConfig);