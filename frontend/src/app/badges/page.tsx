"use client";

import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

const CHECKIN_ADDRESS = (process.env.NEXT_PUBLIC_CHECKIN_ADDRESS ?? "0x0") as `0x${string}`;

const CHECKIN_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "uri",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
] as const;

const CATEGORIES = [
  { id: 1, name: "Africa Explorer", emoji: "🌍", color: "#F59E0B", range: [1, 25] },
  { id: 2, name: "Crypto Master", emoji: "⛓", color: "#8B5CF6", range: [26, 50] },
  { id: 3, name: "Culture Keeper", emoji: "📜", color: "#D97706", range: [51, 75] },
  { id: 4, name: "Tech Wizard", emoji: "⚡", color: "#06B6D4", range: [76, 100] },
  { id: 5, name: "Sport Champion", emoji: "🏆", color: "#EF4444", range: [101, 125] },
  { id: 6, name: "Trivia Legend", emoji: "✨", color: "#35D07F", range: [126, 150] },
];

const RARITIES = ["Common", "Common", "Common", "Common", "Common",
  "Uncommon", "Uncommon", "Uncommon", "Uncommon", "Uncommon",
  "Rare", "Rare", "Rare", "Rare", "Rare",
  "Epic", "Epic", "Epic", "Epic", "Epic",
  "Legendary", "Legendary", "Legendary", "Legendary", "Legendary"];

const RARITY_COLORS: Record<string, string> = {
  Common: "#9CA3AF",
  Uncommon: "#35D07F",
  Rare: "#06B6D4",
  Epic: "#8B5CF6",
  Legendary: "#FBCD00",
};

function BadgeCard({ tokenId, address, category }: {
  tokenId: number;
  address: `0x${string}`;
  category: typeof CATEGORIES[0];
}) {
  const { data: balance } = useReadContract({
    address: CHECKIN_ADDRESS,
    abi: CHECKIN_ABI,
    functionName: "balanceOf",
    args: [address, BigInt(tokenId)],
  });

  const owned = Number(balance ?? 0) > 0;
  const rarityIdx = (tokenId - 1) % 25;
  const rarity = RARITIES[rarityIdx];

  if (!owned) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border p-3 text-center"
      style={{
        background: `${category.color}12`,
        borderColor: `${category.color}33`,
      }}
    >
      <div className="text-3xl mb-2">{category.emoji}</div>
      <p className="text-white text-xs font-bold leading-tight">
        {category.name}
      </p>
      <p className="text-xs font-bold mt-1" style={{ color: RARITY_COLORS[rarity] }}>
        {rarity}
      </p>
      <p className="text-white/30 text-xs mt-0.5">#{String(tokenId).padStart(3, "0")}</p>
    </motion.div>
  );
}

function CategorySection({ category, address }: {
  category: typeof CATEGORIES[0];
  address: `0x${string}`;
}) {
  const [expanded, setExpanded] = useState(false);
  const tokenIds = Array.from(
    { length: category.range[1] - category.range[0] + 1 },
    (_, i) => category.range[0] + i
  );

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/8 transition-all"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.emoji}</span>
          <div className="text-left">
            <p className="text-white font-bold text-sm">{category.name}</p>
            <p className="text-white/30 text-xs">#{category.range[0]} — #{category.range[1]}</p>
          </div>
        </div>
        <span className="text-white/40 text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 grid grid-cols-4 gap-2"
        >
          {tokenIds.map(id => (
            <BadgeCard key={id} tokenId={id} address={address} category={category} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function BadgesPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
      >
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-4">Connect your wallet</p>
          <button onClick={() => router.push("/")}
            className="bg-[#FBCD00] text-[#0a0b0f] font-black px-8 py-3 rounded-2xl"
          >Go Back</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col px-4 pt-6 pb-8 relative"
      style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a2744 0%, #0a0b0f 60%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="max-w-md mx-auto w-full z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >←</button>
          <div>
            <h1 className="text-white font-black text-2xl tracking-tight">My Badges 🎨</h1>
            <p className="text-white/30 text-xs mt-0.5">150 unique NFTs on Celo Mainnet</p>
          </div>
        </div>

        {/* Rarity legend */}
        <div className="rounded-2xl border border-white/8 p-3 mb-4 flex gap-2 flex-wrap"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {Object.entries(RARITY_COLORS).map(([rarity, color]) => (
            <div key={rarity} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color }}>{rarity}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        {CATEGORIES.map(cat => (
          <CategorySection key={cat.id} category={cat} address={address!} />
        ))}

        {/* CTA */}
        <button
          onClick={() => router.push("/checkin")}
          className="w-full font-black text-base py-4 rounded-2xl transition-all active:scale-95 mt-4"
          style={{ background: "linear-gradient(135deg, #FBCD00 0%, #f0a500 100%)", color: "#0a0b0f" }}
        >
          🔥 Earn More Badges
        </button>
      </div>
    </main>
  );
}