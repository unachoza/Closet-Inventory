// Inline SVG illustrations for each phase (Journey A)

import type { ReactElement } from "react";

interface Props {
  phaseId: string;
  accent: string;
}

const PhaseIllustration = ({ phaseId, accent }: Props) => {
  const illustrations: Record<string, ReactElement> = {
    sourcing: (
      <svg viewBox="0 0 110 110" width="100" height="100" aria-hidden="true">
        <ellipse cx="55" cy="90" rx="38" ry="8" fill={accent} opacity={0.18} />
        <line x1="55" y1="88" x2="55" y2="52" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="55" y1="72" x2="36" y2="60" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <line x1="55" y1="65" x2="72" y2="56" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <circle cx="33" cy="57" r="9" fill={accent} opacity={0.25} />
        <circle cx="33" cy="57" r="6" fill="white" opacity={0.9} />
        <circle cx="33" cy="57" r="3" fill={accent} opacity={0.4} />
        <circle cx="72" cy="54" r="9" fill={accent} opacity={0.25} />
        <circle cx="72" cy="54" r="6" fill="white" opacity={0.9} />
        <circle cx="72" cy="54" r="3" fill={accent} opacity={0.4} />
        <ellipse cx="55" cy="38" rx="14" ry="10" fill="white" stroke={accent} strokeWidth="1.5" />
        <circle cx="55" cy="27" r="7" fill="white" stroke={accent} strokeWidth="1.5" />
        <line x1="46" y1="46" x2="44" y2="54" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="47" x2="50" y2="55" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="60" y1="47" x2="60" y2="55" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="64" y1="46" x2="66" y2="54" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="40" cy="80" rx="7" ry="4" fill={accent} opacity={0.4} transform="rotate(-20,40,80)" />
        <circle cx="46" cy="76" r="3" fill={accent} opacity={0.5} />
        <circle cx="78" cy="78" r="2" fill={accent} opacity={0.5} />
        <circle cx="83" cy="81" r="2" fill={accent} opacity={0.5} />
        <circle cx="78" cy="85" r="2" fill={accent} opacity={0.5} />
        <circle cx="83" cy="75" r="2" fill={accent} opacity={0.5} />
      </svg>
    ),
    spinning: (
      <svg viewBox="0 0 110 110" width="100" height="100" aria-hidden="true">
        <circle cx="55" cy="55" r="36" fill="none" stroke={accent} strokeWidth="2" opacity={0.3} />
        <circle cx="55" cy="55" r="26" fill="none" stroke={accent} strokeWidth="1.5" opacity={0.2} />
        <line x1="55" y1="19" x2="55" y2="91" stroke={accent} strokeWidth="1.5" opacity={0.35} />
        <line x1="19" y1="55" x2="91" y2="55" stroke={accent} strokeWidth="1.5" opacity={0.35} />
        <line x1="29" y1="29" x2="81" y2="81" stroke={accent} strokeWidth="1.5" opacity={0.35} />
        <line x1="81" y1="29" x2="29" y2="81" stroke={accent} strokeWidth="1.5" opacity={0.35} />
        <circle cx="55" cy="55" r="8" fill={accent} opacity={0.8} />
        <circle cx="55" cy="55" r="4" fill="white" opacity={0.9} />
        <path d="M55 55 Q70 40 80 50 Q90 60 78 72 Q65 84 52 78 Q38 70 42 58 Q47 44 58 44" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity={0.7} />
        <circle cx="85" cy="28" r="12" fill={accent} opacity={0.15} />
        <circle cx="85" cy="28" r="10" fill={accent} opacity={0.2} />
        <path d="M78 22 Q85 18 92 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M76 28 Q85 24 93 30" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M78 34 Q85 30 91 36" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    construction: (
      <svg viewBox="0 0 110 110" width="100" height="100" aria-hidden="true">
        <rect x="22" y="20" width="66" height="70" rx="4" fill="none" stroke={accent} strokeWidth="2" opacity={0.4} />
        {[32, 40, 48, 56, 64, 72, 80].map((x) => (
          <line key={x} x1={x} y1="20" x2={x} y2="90" stroke={accent} strokeWidth="1.5" opacity={0.5} />
        ))}
        <path d="M22 35 Q28 32 32 35 Q36 38 40 35 Q44 32 48 35 Q52 38 56 35 Q60 32 64 35 Q68 38 72 35 Q76 32 80 35 Q84 38 88 35" fill="none" stroke={accent} strokeWidth="2" opacity={0.7} />
        <path d="M22 45 Q28 48 32 45 Q36 42 40 45 Q44 48 48 45 Q52 42 56 45 Q60 48 64 45 Q68 42 72 45 Q76 48 80 45 Q84 42 88 45" fill="none" stroke={accent} strokeWidth="2" opacity={0.7} />
        <path d="M22 55 Q28 52 32 55 Q36 58 40 55 Q44 52 48 55 Q52 58 56 55 Q60 52 64 55 Q68 58 72 55 Q76 52 80 55 Q84 58 88 55" fill="none" stroke={accent} strokeWidth="2" opacity={0.7} />
        <path d="M22 65 Q28 68 32 65 Q36 62 40 65 Q44 68 48 65 Q52 62 56 65 Q60 68 64 65 Q68 62 72 65 Q76 68 80 65 Q84 62 88 65" fill="none" stroke={accent} strokeWidth="2" opacity={0.7} />
        <rect x="58" y="71" width="28" height="10" rx="5" fill={accent} opacity={0.8} />
        <circle cx="62" cy="76" r="3" fill="white" opacity={0.8} />
      </svg>
    ),
    wetprocessing: (
      <svg viewBox="0 0 110 110" width="100" height="100" aria-hidden="true">
        <path d="M25 50 Q22 90 30 92 L80 92 Q88 90 85 50 Z" fill={accent} opacity={0.18} />
        <path d="M25 50 Q22 90 30 92 L80 92 Q88 90 85 50 Z" fill="none" stroke={accent} strokeWidth="2" />
        <ellipse cx="55" cy="50" rx="30" ry="8" fill={accent} opacity={0.25} />
        <ellipse cx="55" cy="50" rx="30" ry="8" fill="none" stroke={accent} strokeWidth="2" />
        <ellipse cx="55" cy="52" rx="26" ry="5" fill={accent} opacity={0.4} />
        <path d="M40 20 Q50 30 40 42 Q50 48 55 50" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
        <circle cx="44" cy="68" r="3" fill={accent} opacity={0.3} />
        <circle cx="55" cy="72" r="4" fill={accent} opacity={0.25} />
        <circle cx="66" cy="65" r="2.5" fill={accent} opacity={0.3} />
        <rect x="82" y="25" width="14" height="10" rx="3" fill={accent} opacity={0.8} />
        <rect x="82" y="38" width="14" height="10" rx="3" fill={accent} opacity={0.55} />
        <rect x="82" y="51" width="14" height="10" rx="3" fill={accent} opacity={0.35} />
        <path d="M30 30 Q33 24 30 18" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />
        <path d="M40 26 Q43 20 40 14" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />
        <path d="M50 24 Q53 18 50 12" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />
      </svg>
    ),
    assembly: (
      <svg viewBox="0 0 110 110" width="100" height="100" aria-hidden="true">
        <path d="M35 30 L20 55 L32 58 L32 85 L78 85 L78 58 L90 55 L75 30 L65 38 Q55 44 45 38 Z" fill={accent} opacity={0.15} stroke={accent} strokeWidth="2" strokeLinejoin="round" />
        <path d="M45 38 Q55 48 65 38" fill="none" stroke={accent} strokeWidth="1.5" />
        <g transform="translate(60,20) rotate(30)">
          <line x1="0" y1="0" x2="18" y2="0" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity={0.8} />
          <line x1="0" y1="4" x2="18" y2="4" stroke={accent} strokeWidth="2.5" strokeLinecap="round" opacity={0.8} />
          <circle cx="0" cy="2" r="4" fill="none" stroke={accent} strokeWidth="1.5" opacity={0.8} />
        </g>
        <path d="M18 25 Q22 40 18 55" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" opacity={0.6} />
        <line x1="20" y1="23" x2="16" y2="27" stroke={accent} strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="24" r="2" fill="none" stroke={accent} strokeWidth="1.5" />
        <line x1="55" y1="60" x2="55" y2="80" stroke={accent} strokeWidth="1" strokeDasharray="3 2" opacity={0.5} />
        <rect x="58" y="86" width="14" height="9" rx="2" fill="white" stroke={accent} strokeWidth="1.2" />
        <line x1="58" y1="90" x2="72" y2="90" stroke={accent} strokeWidth="0.8" opacity={0.5} />
      </svg>
    ),
  };

  return illustrations[phaseId] ?? <span style={{ fontSize: 36 }}>{"?"}</span>;
};

export default PhaseIllustration;
