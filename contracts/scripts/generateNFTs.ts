import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const PINATA_JWT = process.env.PINATA_JWT!;

// ── 150 combinaisons uniques ──────────────────────────────

const CATEGORIES = [
  { id: 1, name: "Africa Explorer", category: "Géographie Africaine", emoji: "🌍" },
  { id: 2, name: "Crypto Master", category: "Web3 & Crypto", emoji: "⛓" },
  { id: 3, name: "Culture Keeper", category: "Histoire & Culture", emoji: "📜" },
  { id: 4, name: "Tech Wizard", category: "Science & Tech", emoji: "⚡" },
  { id: 5, name: "Sport Champion", category: "Sports", emoji: "🏆" },
  { id: 6, name: "Trivia Legend", category: "Culture Générale", emoji: "✨" },
];

const RARITIES = [
  { name: "Common", multiplier: 1, border: 1, glowIntensity: 0.2, starCount: 3 },
  { name: "Uncommon", multiplier: 2, border: 2, glowIntensity: 0.35, starCount: 5 },
  { name: "Rare", multiplier: 3, border: 2.5, glowIntensity: 0.5, starCount: 7 },
  { name: "Epic", multiplier: 4, border: 3, glowIntensity: 0.65, starCount: 10 },
  { name: "Legendary", multiplier: 5, border: 4, glowIntensity: 0.9, starCount: 14 },
];

const PALETTES = [
  { color1: "#FBCD00", color2: "#F59E0B", color3: "#92400E", bg1: "#1a1500", bg2: "#0a0b0f" },
  { color1: "#8B5CF6", color2: "#6D28D9", color3: "#4C1D95", bg1: "#0f0a1a", bg2: "#0a0b0f" },
  { color1: "#06B6D4", color2: "#0284C7", color3: "#075985", bg1: "#0a1520", bg2: "#0a0b0f" },
  { color1: "#35D07F", color2: "#059669", color3: "#064E3B", bg1: "#0a1510", bg2: "#0a0b0f" },
  { color1: "#EF4444", color2: "#B91C1C", color3: "#7F1D1D", bg1: "#1a0a0a", bg2: "#0a0b0f" },
  { color1: "#F97316", color2: "#EA580C", color3: "#9A3412", bg1: "#1a1000", bg2: "#0a0b0f" },
  { color1: "#EC4899", color2: "#BE185D", color3: "#831843", bg1: "#1a0a15", bg2: "#0a0b0f" },
  { color1: "#A3E635", color2: "#65A30D", color3: "#3F6212", bg1: "#0f1a0a", bg2: "#0a0b0f" },
  { color1: "#38BDF8", color2: "#0EA5E9", color3: "#0369A1", bg1: "#0a1520", bg2: "#0a0b0f" },
  { color1: "#C084FC", color2: "#A855F7", color3: "#7E22CE", bg1: "#0f0a1a", bg2: "#0a0b0f" },
];

const BACKGROUNDS = [
  "circuit",
  "hexagon",
  "stars",
  "waves",
  "diamonds",
];

const FRAMES = [
  "hexagon",
  "circle",
  "shield",
  "diamond",
  "octagon",
];

// ── Générateur de background ──────────────────────────────
function generateBackground(type: string, color: string): string {
  switch (type) {
    case "circuit":
      return `
        <line x1="0" y1="128" x2="512" y2="128" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <line x1="0" y1="256" x2="512" y2="256" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <line x1="0" y1="384" x2="512" y2="384" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <line x1="128" y1="0" x2="128" y2="512" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <line x1="256" y1="0" x2="256" y2="512" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <line x1="384" y1="0" x2="384" y2="512" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <circle cx="128" cy="128" r="4" fill="${color}" opacity="0.3"/>
        <circle cx="384" cy="128" r="4" fill="${color}" opacity="0.3"/>
        <circle cx="128" cy="384" r="4" fill="${color}" opacity="0.3"/>
        <circle cx="384" cy="384" r="4" fill="${color}" opacity="0.3"/>
        <circle cx="256" cy="128" r="3" fill="${color}" opacity="0.2"/>
        <circle cx="256" cy="384" r="3" fill="${color}" opacity="0.2"/>
      `;
    case "hexagon":
      return `
        <polygon points="256,40 310,70 310,130 256,160 202,130 202,70" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <polygon points="256,160 310,190 310,250 256,280 202,250 202,190" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <polygon points="256,280 310,310 310,370 256,400 202,370 202,310" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.15"/>
        <polygon points="130,100 184,130 184,190 130,220 76,190 76,130" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.1"/>
        <polygon points="382,100 436,130 436,190 382,220 328,190 328,130" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.1"/>
      `;
    case "stars":
      return `
        <circle cx="60" cy="60" r="2" fill="${color}" opacity="0.4"/>
        <circle cx="150" cy="40" r="1.5" fill="${color}" opacity="0.3"/>
        <circle cx="420" cy="80" r="2" fill="${color}" opacity="0.4"/>
        <circle cx="460" cy="160" r="1.5" fill="${color}" opacity="0.3"/>
        <circle cx="40" cy="300" r="2" fill="${color}" opacity="0.4"/>
        <circle cx="80" cy="420" r="1.5" fill="${color}" opacity="0.3"/>
        <circle cx="430" cy="380" r="2" fill="${color}" opacity="0.4"/>
        <circle cx="470" cy="460" r="1.5" fill="${color}" opacity="0.3"/>
        <circle cx="200" cy="30" r="1" fill="${color}" opacity="0.2"/>
        <circle cx="350" cy="490" r="1" fill="${color}" opacity="0.2"/>
        <circle cx="30" cy="200" r="1" fill="${color}" opacity="0.2"/>
        <circle cx="490" cy="300" r="1" fill="${color}" opacity="0.2"/>
      `;
    case "waves":
      return `
        <path d="M0,150 Q128,120 256,150 Q384,180 512,150" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.12"/>
        <path d="M0,200 Q128,170 256,200 Q384,230 512,200" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.12"/>
        <path d="M0,300 Q128,270 256,300 Q384,330 512,300" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.12"/>
        <path d="M0,350 Q128,320 256,350 Q384,380 512,350" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.12"/>
      `;
    case "diamonds":
      return `
        <rect x="236" y="20" width="40" height="40" transform="rotate(45 256 40)" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.12"/>
        <rect x="56" y="140" width="40" height="40" transform="rotate(45 76 160)" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.12"/>
        <rect x="416" y="140" width="40" height="40" transform="rotate(45 436 160)" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.12"/>
        <rect x="56" y="320" width="40" height="40" transform="rotate(45 76 340)" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.12"/>
        <rect x="416" y="320" width="40" height="40" transform="rotate(45 436 340)" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.12"/>
        <rect x="236" y="440" width="40" height="40" transform="rotate(45 256 460)" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.12"/>
      `;
    default:
      return "";
  }
}

// ── Générateur de frame ───────────────────────────────────
function generateFrame(type: string, color1: string, color2: string, borderWidth: number): string {
  switch (type) {
    case "hexagon":
      return `
        <polygon points="256,70 396,150 396,310 256,390 116,310 116,150"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth * 1.5}" opacity="0.7"/>
        <polygon points="256,90 376,163 376,297 256,370 136,297 136,163"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth}" opacity="0.4"/>
      `;
    case "circle":
      return `
        <circle cx="256" cy="230" r="160" fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth * 1.5}" opacity="0.7"/>
        <circle cx="256" cy="230" r="145" fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth}" opacity="0.4"/>
      `;
    case "shield":
      return `
        <path d="M256,60 L390,120 L390,280 Q390,370 256,410 Q122,370 122,280 L122,120 Z"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth * 1.5}" opacity="0.7"/>
        <path d="M256,80 L375,135 L375,278 Q375,358 256,395 Q137,358 137,278 L137,135 Z"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth}" opacity="0.4"/>
      `;
    case "diamond":
      return `
        <polygon points="256,55 430,230 256,405 82,230"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth * 1.5}" opacity="0.7"/>
        <polygon points="256,80 410,230 256,380 102,230"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth}" opacity="0.4"/>
      `;
    case "octagon":
      return `
        <polygon points="166,76 346,76 436,166 436,346 346,436 166,436 76,346 76,166"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth * 1.5}" opacity="0.7"/>
        <polygon points="176,96 336,96 416,176 416,336 336,416 176,416 96,336 96,176"
          fill="none" stroke="url(#badge-grad)" stroke-width="${borderWidth}" opacity="0.4"/>
      `;
    default:
      return "";
  }
}

// ── Générateur d'étoiles déco ─────────────────────────────
function generateStars(count: number, color: string): string {
  const positions = [
    [40, 50], [472, 50], [40, 472], [472, 472],
    [256, 30], [256, 490], [30, 256], [490, 256],
    [100, 100], [412, 100], [100, 412], [412, 412],
    [170, 40], [342, 40],
  ];
  return positions.slice(0, count).map(([x, y]) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="12" fill="${color}" opacity="0.4">✦</text>`
  ).join("\n");
}

// ── TRIVQ Symbol SVG (le logo du token) ───────────────────
function generateTRIVQSymbol(color1: string, color2: string, x: number, y: number, size: number): string {
  return `
    <!-- TRIVQ Token Symbol -->
    <circle cx="${x}" cy="${y}" r="${size}" fill="url(#badge-grad)" opacity="0.9" filter="url(#shadow)"/>
    <circle cx="${x}" cy="${y}" r="${size - 4}" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <text x="${x}" y="${y + size * 0.15}" text-anchor="middle" 
      font-size="${size * 0.55}" font-weight="900" font-family="Arial Black, sans-serif"
      fill="rgba(10,11,15,0.9)">Q</text>
    <text x="${x}" y="${y - size * 0.25}" text-anchor="middle"
      font-size="${size * 0.22}" font-weight="bold" font-family="Arial, sans-serif"
      fill="rgba(10,11,15,0.7)">$TRIVQ</text>
  `;
}

// ── Générateur SVG principal ──────────────────────────────
function generateSVG(nft: {
  id: number;
  name: string;
  category: string;
  emoji: string;
  rarity: typeof RARITIES[0];
  palette: typeof PALETTES[0];
  background: string;
  frame: string;
  edition: number;
}): string {
  const { palette, rarity, background, frame } = nft;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${palette.bg1}"/>
      <stop offset="100%" stop-color="${palette.bg2}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.color1}" stop-opacity="${rarity.glowIntensity}"/>
      <stop offset="100%" stop-color="${palette.color1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.color1}"/>
      <stop offset="100%" stop-color="${palette.color2}"/>
    </linearGradient>
    <linearGradient id="text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette.color1}"/>
      <stop offset="100%" stop-color="${palette.color3}"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="${palette.color1}" flood-opacity="${rarity.glowIntensity + 0.2}"/>
    </filter>
    <filter id="glow-filter">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg-grad)" rx="24"/>

  <!-- Background pattern -->
  ${generateBackground(background, palette.color1)}

  <!-- Ambient glow -->
  <circle cx="256" cy="220" r="190" fill="url(#glow)"/>

  <!-- Frame -->
  ${generateFrame(frame, palette.color1, palette.color2, rarity.border)}

  <!-- Inner fill subtle -->
  <circle cx="256" cy="220" r="120" fill="${palette.color1}" opacity="0.05"/>

  <!-- TRIVQ Token Symbol — toujours présent et central -->
  ${generateTRIVQSymbol(palette.color1, palette.color2, 256, 185, 80)}

  <!-- Category emoji -->
  <text x="256" y="305" text-anchor="middle" font-size="32"
    font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${nft.emoji}</text>

  <!-- NFT Name -->
  <text x="256" y="345" text-anchor="middle" font-size="20" font-weight="900"
    font-family="Arial Black, sans-serif" fill="${palette.color1}"
    filter="url(#shadow)">${nft.name}</text>

  <!-- Category -->
  <text x="256" y="368" text-anchor="middle" font-size="12"
    font-family="Arial, sans-serif" fill="rgba(255,255,255,0.45)">${nft.category}</text>

  <!-- Rarity badge -->
  <rect x="176" y="380" width="160" height="24" rx="12"
    fill="${palette.color1}" opacity="0.15"/>
  <rect x="176" y="380" width="160" height="24" rx="12"
    fill="none" stroke="${palette.color1}" stroke-width="1" opacity="0.4"/>
  <text x="256" y="397" text-anchor="middle" font-size="11" font-weight="bold"
    font-family="Arial, sans-serif" fill="${palette.color1}">⬡ ${nft.rarity.name.toUpperCase()}</text>

  <!-- Edition -->
  <text x="256" y="430" text-anchor="middle" font-size="10"
    font-family="Arial, sans-serif" fill="rgba(255,255,255,0.25)">#${String(nft.edition).padStart(3, "0")} / 150</text>

  <!-- TriviaQ watermark -->
  <text x="256" y="455" text-anchor="middle" font-size="10"
    font-family="Arial, sans-serif" fill="rgba(255,255,255,0.15)">TriviaQ · Celo Network</text>

  <!-- Decorative stars -->
  ${generateStars(rarity.starCount, palette.color1)}
</svg>`;
}

// ── Upload sur Pinata ─────────────────────────────────────
async function uploadSVGToPinata(svg: string, name: string): Promise<string> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const formData = new FormData();
  formData.append("file", blob, `${name}.svg`);
  formData.append("pinataMetadata", JSON.stringify({ name: `TriviaQ-NFT-${name}` }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  const data = await res.json() as { IpfsHash?: string};
  if (!data.IpfsHash) throw new Error(`Pinata SVG failed: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

async function uploadMetadataToPinata(metadata: object, name: string): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: `TriviaQ-Meta-${name}` },
    }),
  });

  const data = await res.json() as { IpfsHash?: string};
  if (!data.IpfsHash) throw new Error(`Pinata metadata failed: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

// ── Générer 150 combinaisons uniques ──────────────────────
function generateAllNFTs() {
  const nfts = [];
  let id = 1;

  // 6 catégories × 5 rarités × 5 backgrounds × 1 frame chacun = 150
  for (const category of CATEGORIES) {
    for (const rarity of RARITIES) {
      for (let bgIdx = 0; bgIdx < 5; bgIdx++) {
        const paletteIdx = (category.id - 1 + bgIdx + rarity.multiplier) % PALETTES.length;
        const frameIdx = (category.id + bgIdx + rarity.multiplier) % FRAMES.length;

        nfts.push({
          id,
          name: `${category.name} #${String(id).padStart(3, "0")}`,
          category: category.category,
          emoji: category.emoji,
          rarity,
          palette: PALETTES[paletteIdx],
          background: BACKGROUNDS[bgIdx],
          frame: FRAMES[frameIdx],
          edition: id,
          categoryId: category.id,
        });
        id++;
      }
    }
  }
  return nfts;
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log("🚀 TriviaQ NFT Generator — 150 unique NFTs\n");

  if (!PINATA_JWT) throw new Error("PINATA_JWT not set");

  const nfts = generateAllNFTs();
  console.log(`📦 ${nfts.length} NFTs to generate\n`);

  const results: object[] = [];
  const outputDir = path.join(process.cwd(), "nft-previews");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  for (const nft of nfts) {
    console.log(`🏅 [${nft.id}/150] ${nft.emoji} ${nft.name} — ${nft.rarity.name}`);

    try {
      // 1. Générer SVG
      const svg = generateSVG(nft);

      // 2. Sauvegarder localement
      fs.writeFileSync(path.join(outputDir, `nft-${nft.id}.svg`), svg);

      // 3. Upload image Pinata
      const imageUri = await uploadSVGToPinata(svg, `nft-${nft.id}`);
      console.log(`  ✅ Image: ${imageUri}`);

      // 4. Metadata ERC-1155
      const metadata = {
        name: nft.name,
        description: `TriviaQ NFT Badge — ${nft.category}. Earn by playing TriviaQ on Celo Network.`,
        image: imageUri,
        external_url: "https://trivia-quest-eight.vercel.app",
        attributes: [
          { trait_type: "Category", value: nft.category },
          { trait_type: "Rarity", value: nft.rarity.name },
          { trait_type: "Edition", value: `${nft.edition}/150` },
          { trait_type: "Background", value: nft.background },
          { trait_type: "Frame", value: nft.frame },
          { trait_type: "Multiplier", value: `x${nft.rarity.multiplier}` },
          { trait_type: "Network", value: "Celo Mainnet" },
          { trait_type: "Token", value: "$TRIVQ" },
          { trait_type: "Game", value: "TriviaQ" },
        ],
        background_color: nft.palette.color1.replace("#", ""),
      };

      // 5. Upload metadata Pinata
      const metadataUri = await uploadMetadataToPinata(metadata, `nft-${nft.id}`);
      console.log(`  ✅ Metadata: ${metadataUri}`);

      results.push({
        id: nft.id,
        name: nft.name,
        category: nft.category,
        rarity: nft.rarity.name,
        categoryId: nft.categoryId,
        imageUri,
        metadataUri,
      });

      // Pause pour éviter rate limit Pinata
      await new Promise((r) => setTimeout(r, 500));

    } catch (err) {
      console.error(`  ❌ Error NFT #${nft.id}:`, err);
    }
  }

  // Sauvegarder tout
  const outputPath = path.join(process.cwd(), "nft-uris.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n══════════════════════════════════════════════");
  console.log(`✅ ${results.length}/150 NFTs generated!`);
  console.log("📄 URIs saved to nft-uris.json");
  console.log("🖼️  Previews saved to nft-previews/");
  console.log("══════════════════════════════════════════════");
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});