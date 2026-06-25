import "@/lib/polyfills";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { SupportButton } from "@/components/SupportButton";
import FarcasterLoader from "@/components/FarcasterLoader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://trivia-quest-eight.vercel.app"),
  title: "Trivia Q — Play. Learn. Earn on Celo.",
  description:
    "Quiz game with real rewards on the Celo blockchain. Answer questions, earn $TRIVQ tokens and climb the leaderboard.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: "Trivia Q — Play. Learn. Earn on Celo.",
    description: "Quiz game with real rewards on the Celo blockchain.",
    url: "https://trivia-quest-eight.vercel.app",
    siteName: "Trivia Q",
    type: "website",
  },
  other: {
    "talentapp:project_verification":
      "37ab229ec7b57c297e0d4450f934b4bad9b287ea73370cc1cb258e84e4f9da6c38c5982849aa04cca1033f139ad77f56eb1d9e9fe442ccf043098fcdf80f4342",
    "base:app_id": "69d393ef87bcdc902b52fd27",
    "fc:frame": JSON.stringify({
  version: "next",
  imageUrl: "https://trivia-quest-eight.vercel.app/opengraph-image",
  button: {
    title: "Play Now 🎮",
    action: {
      type: "launch_frame",
      name: "Trivia Q",          // ← ajoute cette ligne
      url: "https://trivia-quest-eight.vercel.app",
      splashImageUrl: "https://trivia-quest-eight.vercel.app/icon-512.png",
      splashBackgroundColor: "#1A1A2E",
    },
  },
}),
  },
};

export const viewport: Viewport = {
  themeColor: "#FBCD00",
  width: "device-width",
  initialScale: 1,
  // ✅ maximumScale supprimé — bloquait zoom accessibilité + pénalisait score MiniPay
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://forno.celo.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://forno.celo.org" />
        <link rel="dns-prefetch" href="https://api.geckoterminal.com" />
      </head>
      <body>
        {/* Inline loading shell — paints immediately from HTML stream, unblocks FCP/LCP */}
        <div
          id="tq-shell"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "linear-gradient(160deg,#0a0f1e 0%,#050709 50%,#0a0f1e 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
          }}
        >
          <svg width="56" height="56" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
            <circle cx="120" cy="120" r="120" fill="#FBCD00"/>
            <circle cx="120" cy="120" r="88" fill="white"/>
            <text x="68" y="158" fontFamily="Arial Black" fontWeight="900" fontSize="105" fill="#FBCD00">Q</text>
            <circle cx="172" cy="168" r="14" fill="#35D07F"/>
          </svg>
          <div style={{ color: "white", fontWeight: 900, fontSize: "36px", letterSpacing: "-0.5px", lineHeight: 1 }}>
            Trivia<span style={{ color: "#FBCD00" }}>Q</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
            Play. Learn. Earn on Celo.
          </div>
        </div>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <FarcasterLoader />
            <main>{children}</main>
            <SupportButton />
            <footer
              style={{
                textAlign: "center",
                padding: "1rem",
                borderTop: "0.5px solid rgba(255,255,255,0.06)",
              }}
            >
              <a
                href="/terms"
                target="_self"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.7rem",
                  marginRight: "1rem",
                }}
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                target="_self"
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
              >
                Privacy Policy
              </a>
            </footer>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}