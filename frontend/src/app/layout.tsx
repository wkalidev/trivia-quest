import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trivia Q — Play. Learn. Earn on Celo.",
  description: "Quiz game with real CELO rewards on the blockchain",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FBCD00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}