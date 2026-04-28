"use client";

/**
 * Bouton de support in-app — requis MiniPay §6
 * Doit être accessible depuis toutes les pages de l'app.
 * Canal : Telegram (remplace VOTRE_LIEN par ton lien Telegram/WhatsApp/email)
 */

const SUPPORT_URL = "mailto:wkalidev@gmail.com";

export function SupportButton() {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support"
      style={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2.5rem",
        height: "2.5rem",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        border: "0.5px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: "rgba(255,255,255,0.5)",
        fontSize: "1.1rem",
        textDecoration: "none",
        transition: "background 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "rgba(255,255,255,0.14)";
        (e.currentTarget as HTMLAnchorElement).style.color =
          "rgba(255,255,255,0.9)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLAnchorElement).style.color =
          "rgba(255,255,255,0.5)";
      }}
    >
      ?
    </a>
  );
}