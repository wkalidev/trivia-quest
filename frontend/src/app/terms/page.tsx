"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
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
            Terms of Service
          </h1>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-white/70 text-sm leading-relaxed">
          <p className="text-white/40 text-xs">Last updated: April 2026</p>

          <section>
            <h2 className="text-white font-bold text-base mb-2">1. About Trivia Q</h2>
            <p>
              Trivia Q is a blockchain-powered quiz game developed and maintained by
              wkalidev as an open-source personal project, licensed under the MIT
              License. The game is deployed on the Celo blockchain and allows players
              to earn $TRIVQ tokens by answering quiz questions.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Acceptance</h2>
            <p>
              By using Trivia Q, you agree to these terms. If you do not agree, please
              do not use the application.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Eligibility</h2>
            <p>
              You must be at least 18 years old to use Trivia Q. By using the app, you
              confirm that you meet this requirement and that using the app is legal in
              your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Blockchain & Tokens</h2>
            <p>
              Trivia Q interacts with the Celo blockchain. All on-chain transactions are
              irreversible. The $TRIVQ token is a utility token with no guaranteed
              monetary value. Network fees ("network fees") may apply to on-chain
              actions and are paid to the Celo network, not to Trivia Q.
            </p>
            <p className="mt-2">
              Trivia Q is not a financial product. $TRIVQ tokens do not represent
              equity, debt, or any financial instrument.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. User Responsibilities</h2>
            <p>You are solely responsible for:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>securing your wallet and private keys</li>
              <li>ensuring your use complies with local laws</li>
              <li>any taxes arising from token rewards in your jurisdiction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Disclaimer of Warranties</h2>
            <p>
              Trivia Q is provided "as is" without warranty of any kind, as stated in
              the MIT License. The developer makes no guarantees regarding uptime,
              token availability, prize distributions, or smart contract behavior.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the developer shall not be liable
              for any indirect, incidental, or consequential damages arising from your
              use of Trivia Q, including loss of tokens or funds.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Open Source</h2>
            <p>
              Trivia Q's source code is available on GitHub under the MIT License.
              You are free to fork, modify, and redistribute the code in accordance
              with that license.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Changes</h2>
            <p>
              These terms may be updated at any time. Continued use of the app after
              changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">10. Contact</h2>
            <p>
              For any questions regarding these terms, contact:{" "}
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