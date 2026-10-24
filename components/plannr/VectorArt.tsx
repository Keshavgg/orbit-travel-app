import React from 'react';

interface VectorProps {
  className?: string;
}

export const BaliVectorArt: React.FC<VectorProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 200 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Sky */}
    <rect width="200" height="130" fill="#FCEEE8" />

    {/* Birds */}
    <path
      d="M26 38 C28 35 31 35 34 38 C37 35 40 35 42 38"
      stroke="#1E293B"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M38 46 C39.5 44 41.5 44 43 46 C44.5 44 46.5 44 48 46"
      stroke="#1E293B"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />

    {/* Sun */}
    <circle cx="105" cy="72" r="32" fill="#D95338" />

    {/* Balinese Temple / Candi Bentar Shrine Silhouette */}
    <polygon points="105,42 90,92 120,92" fill="#182346" />
    <rect x="84" y="92" width="42" height="6" fill="#182346" />
    <rect x="78" y="98" width="54" height="6" fill="#182346" />

    {/* Sea */}
    <rect y="104" width="200" height="26" fill="#257288" />

    {/* Sea Ripple Highlights */}
    <path
      d="M30 114 C35 112 45 112 50 114"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M100 116 C105 114 115 114 120 116"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M160 114 C165 112 175 112 180 114"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

export const VietnamVectorArt: React.FC<VectorProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 200 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Sky */}
    <rect width="200" height="130" fill="#E6F2EE" />

    {/* Ha Long Bay Limestone Karsts */}
    <path
      d="M10 102 C15 48 38 48 44 102 Z"
      fill="#265B47"
    />
    <path
      d="M48 102 C54 62 76 62 82 102 Z"
      fill="#43866E"
    />
    <path
      d="M136 102 C142 54 168 54 174 102 Z"
      fill="#265B47"
    />
    <path
      d="M168 102 C172 70 190 70 196 102 Z"
      fill="#43866E"
    />

    {/* Red / Ochre Traditional Junk Sailboat */}
    <path
      d="M98 94 C101 100 125 100 128 94 Z"
      fill="#523218"
    />
    <path
      d="M113 65 L124 91 L113 93 Z"
      fill="#D95338"
    />
    <path
      d="M111 68 L101 92 L111 93 Z"
      fill="#E76F51"
    />
    <line x1="112" y1="63" x2="112" y2="94" stroke="#3E200C" strokeWidth="1.2" />

    {/* Sea */}
    <rect y="98" width="200" height="32" fill="#257288" />

    {/* Water ripples */}
    <path
      d="M20 108 C25 106 35 106 40 108"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M80 112 C85 110 95 110 100 112"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M148 108 C153 106 163 106 168 108"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

export const ThailandVectorArt: React.FC<VectorProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 200 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Tropical Sky */}
    <rect width="200" height="130" fill="#E8F4F8" />
    <circle cx="150" cy="50" r="24" fill="#FBBF24" opacity="0.8" />

    {/* Karst Pillar */}
    <path
      d="M45 104 C40 55 58 45 64 50 C70 55 68 104 68 104 Z"
      fill="#3A6B56"
    />
    <path
      d="M20 104 C15 70 32 65 38 72 C42 78 40 104 40 104 Z"
      fill="#29503F"
    />

    {/* Longtail Boat */}
    <path
      d="M100 96 C105 102 135 102 145 94 L152 86 L144 94 Z"
      fill="#6B4226"
    />
    {/* Colorful ribbon on bow */}
    <circle cx="150" cy="88" r="2.5" fill="#EF4444" />
    <circle cx="152" cy="86" r="2" fill="#3B82F6" />

    {/* Ocean */}
    <rect y="100" width="200" height="30" fill="#1C838A" />
    <path
      d="M90 110 C96 108 108 108 114 110"
      stroke="#E0F7FA"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const JapanVectorArt: React.FC<VectorProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 200 130"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Sky */}
    <rect width="200" height="130" fill="#F8EBF0" />
    <circle cx="100" cy="65" r="30" fill="#DC2626" opacity="0.85" />

    {/* Mt Fuji base */}
    <polygon points="100,50 35,108 165,108" fill="#374151" />
    {/* Snowcap */}
    <polygon points="100,50 82,72 90,70 100,74 110,69 118,72" fill="#FFFFFF" />

    {/* Cherry blossoms silhouettes */}
    <circle cx="30" cy="35" r="6" fill="#F472B6" opacity="0.9" />
    <circle cx="38" cy="30" r="5" fill="#F472B6" opacity="0.8" />
    <circle cx="25" cy="42" r="4" fill="#FBCFE8" opacity="0.9" />

    {/* Lake */}
    <rect y="105" width="200" height="25" fill="#1E3A5F" />
  </svg>
);

export const UbudWaterfallArt: React.FC<VectorProps> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 160 210"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Dark jungle background */}
    <rect width="160" height="210" fill="#14342E" />

    {/* Foliage rounds left */}
    <circle cx="25" cy="65" r="28" fill="#1B4D3E" />
    <circle cx="20" cy="115" r="32" fill="#246450" />
    <circle cx="30" cy="165" r="26" fill="#1B4D3E" />

    {/* Foliage rounds right */}
    <circle cx="138" cy="65" r="28" fill="#1B4D3E" />
    <circle cx="142" cy="115" r="32" fill="#246450" />
    <circle cx="132" cy="165" r="26" fill="#1B4D3E" />

    {/* Flowing waterfall shaft */}
    <rect x="58" y="0" width="44" height="175" fill="#A8D5DE" opacity="0.95" />
    {/* Water torrent streaks */}
    <line x1="68" y1="0" x2="68" y2="170" stroke="#87BAC4" strokeWidth="2.5" />
    <line x1="80" y1="0" x2="80" y2="175" stroke="#FFFFFF" strokeWidth="3" opacity="0.75" />
    <line x1="92" y1="0" x2="92" y2="170" stroke="#87BAC4" strokeWidth="2.5" />

    {/* Canyon base pool */}
    <rect y="165" width="160" height="45" fill="#256B7D" />

    {/* Splash oval ring */}
    <ellipse cx="80" cy="175" rx="35" ry="10" fill="#D3F1F7" opacity="0.9" />
    <ellipse cx="40" cy="192" rx="20" ry="4" fill="#69A8B6" opacity="0.6" />
    <ellipse cx="120" cy="192" rx="20" ry="4" fill="#69A8B6" opacity="0.6" />
  </svg>
);
