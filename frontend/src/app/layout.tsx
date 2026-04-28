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
  description: "Quiz game with real CELO rewards on the blockchain",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-512.png",
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
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            {/* Bouton support in-app — requis MiniPay §6 */}
            <SupportButton />
            {/* Footer légal — requis MiniPay §7 */}
            <footer
              style={{
                textAlign: "center",
                padding: "1rem",
                borderTop: "0.5px solid rgba(255,255,255,0.06)",
              }}
            >
              <Link
                href="/terms"
                style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", marginRight: "1rem" }}
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}
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