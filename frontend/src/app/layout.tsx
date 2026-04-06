import "@/lib/polyfills";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trivia Q — Play. Learn. Earn on Celo.",
  description: "Quiz game with real CELO rewards on the blockchain",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-512.png",
  },
  other: {
    "talentapp:project_verification": "37ab229ec7b57c297e0d4450f934b4bad9b287ea73370cc1cb258e84e4f9da6c38c5982849aa04cca1033f139ad77f56eb1d9e9fe442ccf043098fcdf80f4342",
    "base:app_id": "69d393ef87bcdc902b52fd27",
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
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}