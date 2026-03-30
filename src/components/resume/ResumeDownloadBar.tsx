"use client";

import React from "react";

interface ResumeDownloadBarProps {
  /** Absolute-path href for the resume PDF (e.g. "/docs/resume.pdf") */
  href: string;
  /** Display label */
  label?: string;
}

/**
 * A small fixed bar rendered below the audio controls on the resume page.
 * Stays sticky at the top (below header + audio panel) so users can
 * download the resume from any scroll position.
 *
 * Desktop only — hidden on mobile where the nav sits at the bottom.
 */
export const ResumeDownloadBar: React.FC<ResumeDownloadBarProps> = ({
  href,
  label = "Download Resume",
}) => {
  return (
    <div
      style={{
        position: "fixed",
        /* Header ~56px + audio toggle ~40px + gap ~8px */
        top: "140px",
        left: 0,
        right: 0,
        zIndex: 7,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
      /* Hide on mobile — same breakpoint as Header's hide="s" */
      className="s-flex-hide"
    >
      <a
        href={href}
        download
        style={{
          pointerEvents: "auto",
          fontSize: "var(--font-size-body-s)",
          fontFamily: "var(--font-sans)",
          color: "var(--neutral-on-background-strong)",
          textDecoration: "none",
          padding: "6px 18px",
          borderRadius: "var(--radius-m)",
          border: "1px solid var(--neutral-alpha-medium)",
          background: "var(--page-background)",
          backdropFilter: "blur(8px)",
          whiteSpace: "nowrap",
          lineHeight: 1.5,
          letterSpacing: "0.02em",
          boxShadow: "var(--shadow-s)",
          transition: "border-color 0.15s ease, color 0.15s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "var(--neutral-on-background-strong)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor =
            "var(--neutral-alpha-medium)";
        }}
      >
        ↓ {label}
      </a>
    </div>
  );
};
