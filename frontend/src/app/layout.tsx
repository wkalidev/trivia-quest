import "@/lib/polyfills";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { SupportButton } from "@/components/SupportButton";
import Link from "next/link";
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
        title: "Jouer maintenant 🎮",
        action: {
          type: "launch_frame",
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
        {/* ✅ Préconnexions — économies 300-320ms LCP selon PageSpeed */}
        <link rel="preconnect" href="https://forno.celo.org" />
        <link rel="preconnect" href="https://api.geckoterminal.com" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <main>{children}</main>
            <SupportButton />
            <footer
              style={{
                textAlign: "center",
                padding: "1rem",
                borderTop: "0.5px solid rgba(255,255,255,0.06)",
              }}
            >
              <Link
                href="/terms"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.7rem",
                  marginRight: "1rem",
                }}
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem" }}
              >
                Privacy Policy
              </Link>
            </footer>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}