"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen px-4 pt-6 pb-16"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            ←
          </button>
          <h1 className="text-white font-black text-2xl tracking-tight">
            Privacy Policy
          </h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-white/70 text-sm leading-relaxed">
          <p className="text-white/40 text-xs">Last updated: April 2026</p>

          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Who We Are</h2>
            <p>
              Trivia Q is a personal open-source project developed by wkalidev.
              Contact:{" "}
              <a href="mailto:wkalidev@gmail.com" className="text-[#FBCD00] underline">
                wkalidev@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Data We Collect</h2>
            <p>Trivia Q collects minimal data:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <strong className="text-white/90">Wallet address</strong> — used to
                submit scores and mint $TRIVQ rewards on-chain. Stored on the Celo
                blockchain (public by nature).
              </li>
              <li>
                <strong className="text-white/90">Game scores & points</strong> —
                stored on-chain via the TriviaQuest smart contract.
              </li>
              <li>
                <strong className="text-white/90">Language preference</strong> — stored
                locally in your browser, never sent to a server.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Data We Do NOT Collect</h2>
            <p>Trivia Q does not collect:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>your name, email, or phone number</li>
              <li>location or device data</li>
              <li>cookies or tracking pixels</li>
              <li>any data beyond what is required to play the game</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Blockchain Data</h2>
            <p>
              All scores, points, and token transactions are recorded on the Celo
              blockchain. Blockchain data is public, permanent, and cannot be deleted.
              This is inherent to how blockchain technology works.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Third-Party Services</h2>
            <p>Trivia Q uses the following third-party services:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                <strong className="text-white/90">Celo Network</strong> — blockchain
                infrastructure
              </li>
              <li>
                <strong className="text-white/90">Vercel</strong> — hosting (may collect
                standard server logs; see{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FBCD00] underline"
                >
                  Vercel Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong className="text-white/90">RainbowKit / Wagmi</strong> — wallet
                connection (no personal data collected)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Your Rights (GDPR)</h2>
            <p>
              If you are in the European Union, you have the right to access, correct,
              or request deletion of your personal data. Note that on-chain data cannot
              be deleted due to the nature of blockchain technology.
            </p>
            <p className="mt-2">
              To exercise your rights, contact:{" "}
              <a
                href="mailto:wkalidev@gmail.com"
                className="text-[#FBCD00] underline"
              >
                wkalidev@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Children</h2>
            <p>
              Trivia Q is not directed at children under 18. We do not knowingly
              collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Changes</h2>
            <p>
              This policy may be updated at any time. The date at the top of this page
              reflects the latest revision.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Contact</h2>
            <p>
              Questions about this policy?{" "}
              <a
                href="mailto:wkalidev@gmail.com"
                className="text-[#FBCD00] underline"
              >
                wkalidev@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}