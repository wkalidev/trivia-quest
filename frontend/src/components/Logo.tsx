export function Logo({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      {/* Cercle fond jaune */}
      <circle cx="120" cy="120" r="120" fill="#FBCD00"/>
      {/* Cercle intérieur blanc */}
      <circle cx="120" cy="120" r="88" fill="white"/>
      {/* Grand Q */}
      <text x="68" y="158" fontFamily="Arial Black" fontWeight="900" fontSize="105" fill="#FBCD00">Q</text>
      {/* Point vert */}
      <circle cx="172" cy="168" r="14" fill="#35D07F"/>
      {/* Étoiles décoratives */}
      <circle cx="48" cy="72" r="8" fill="#35D07F"/>
      <circle cx="192" cy="72" r="6" fill="#FF6B6B"/>
      <circle cx="32" cy="148" r="5" fill="#FF6B6B"/>
      <circle cx="34" cy="108" r="4" fill="#6B4FBB"/>
      <circle cx="120" cy="18" r="7" fill="#6B4FBB"/>
      <circle cx="208" cy="140" r="5" fill="#FBCD00" stroke="#FF6B6B" strokeWidth="2"/>
      {/* Confettis */}
      <rect x="24" y="108" width="10" height="10" rx="2" fill="#FF6B6B" transform="rotate(20,29,113)"/>
      <rect x="196" y="98" width="10" height="10" rx="2" fill="#35D07F" transform="rotate(-15,201,103)"/>
      <rect x="72" y="22" width="8" height="8" rx="2" fill="#FBCD00" transform="rotate(35,76,26)"/>
      <rect x="152" y="22" width="8" height="8" rx="2" fill="#FF6B6B" transform="rotate(-25,156,26)"/>
    </svg>
  );
}