import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Screen 4 & 5 Hero Header Artwork
 * Abstract terracotta circular sun, navy mountain peak, birds, wavy horizon
 */
export const BaliHeroArt: React.FC<{ className?: string; compact?: boolean }> = ({
  className = 'w-full h-full',
  compact = false,
}) => (
  <svg
    viewBox={compact ? '0 0 380 90' : '0 0 380 180'}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#A498A9" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#D4C8D2" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#D35136" />
        <stop offset="100%" stopColor="#C4442B" />
      </linearGradient>
    </defs>

    {/* Background Tint */}
    <rect width="380" height={compact ? '90' : '180'} fill="url(#skyGrad)" />

    {/* Birds */}
    <path
      d="M75 32 C80 28 85 28 90 32 C95 28 100 28 105 32"
      stroke="#1B2433"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M290 28 C294 25 298 25 302 28 C306 25 310 25 314 28"
      stroke="#1B2433"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* Big Terracotta Sun */}
    <circle
      cx="190"
      cy={compact ? '50' : '90'}
      r={compact ? '42' : '64'}
      fill="url(#sunGrad)"
    />

    {/* Navy Mountain Triangle Peak */}
    <polygon
      points={compact ? '190,14 150,90 230,90' : '190,40 130,170 250,170'}
      fill="#1A284A"
    />
    <polygon
      points={compact ? '190,14 190,90 230,90' : '190,40 190,170 250,170'}
      fill="#111B35"
      opacity="0.95"
    />

    {/* Subtle Base Ridge / Ocean Wave lines */}
    <path
      d="M80 148 C100 144 120 144 140 148"
      stroke="#4D839E"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M240 148 C260 144 280 144 300 148"
      stroke="#4D839E"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.7"
    />
  </svg>
);

/**
 * 07:30 Tegallalang Rice Terrace Icon
 * Tiered green terraces, palm tree silhouette, pale peach backdrop
 */
export const TegallalangIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <svg
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`rounded-2xl shrink-0 ${className}`}
  >
    {/* Background */}
    <rect width="60" height="60" rx="14" fill="#FCEFE3" />

    {/* Sun Accent */}
    <circle cx="48" cy="20" r="4.5" fill="#E86145" />

    {/* Small Palm Tree Left */}
    <path
      d="M17 28 L17 19"
      stroke="#5A3A1B"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17 19 Q11 16 9 20"
      stroke="#276749"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17 19 Q23 16 25 20"
      stroke="#276749"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M17 19 Q17 13 15 11"
      stroke="#276749"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Stepped Terraces (Bottom 4 tiers) */}
    <rect x="7" y="27" width="46" height="7" rx="3.5" fill="#48BB78" />
    <rect x="7" y="34" width="46" height="7" rx="3.5" fill="#38A169" />
    <rect x="7" y="41" width="46" height="7" rx="3.5" fill="#2F855A" />
    <rect x="7" y="48" width="46" height="7" rx="3.5" fill="#22543D" />
  </svg>
);

/**
 * 10:30 Zest Café Brunch Icon
 * Coconut bowl, steaming brew, warm sand background
 */
export const ZestCafeIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <svg
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`rounded-2xl shrink-0 ${className}`}
  >
    {/* Warm Peach/Sand Background */}
    <rect width="60" height="60" rx="14" fill="#FDF0DF" />

    {/* Table Base / Coaster */}
    <path
      d="M6 46 C16 43 44 43 54 46 L54 54 C54 57 51 60 48 60 L12 60 C9 60 6 57 6 54 Z"
      fill="#D49A58"
    />

    {/* Coconut Bowl / Cup */}
    <rect x="18" y="27" width="24" height="15" rx="5" fill="#FFFFFF" />
    <path
      d="M20 27 H40 V38 C40 41 38 43 35 43 H25 C22 43 20 41 20 38 V27 Z"
      fill="#6B4527"
    />
    <rect x="23" y="30" width="14" height="3" rx="1.5" fill="#D95338" />

    {/* Steam vapor coils */}
    <path
      d="M25 21 C24 17 26 15 25 12"
      stroke="#D95338"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M30 20 C29 16 31 14 30 11"
      stroke="#D95338"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M35 21 C34 17 36 15 35 12"
      stroke="#D95338"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.8"
    />
  </svg>
);

/**
 * 13:00 Tirta Empul Temple Icon
 * Holy water shrine, Balinese split temple gate, sun over sacred spring
 */
export const TirtaEmpulIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <svg
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`rounded-2xl shrink-0 ${className}`}
  >
    {/* Soft pink/peach sky */}
    <rect width="60" height="60" rx="14" fill="#FDECE8" />

    {/* Terracotta Sun */}
    <circle cx="30" cy="28" r="13" fill="#D95338" />

    {/* Dark Temple Shrine Silhouette */}
    <polygon points="30,16 20,44 40,44" fill="#1D2E54" />
    <rect x="17" y="44" width="26" height="3" fill="#1D2E54" />
    <rect x="14" y="47" width="32" height="3" fill="#1D2E54" />

    {/* Holy spring water */}
    <rect y="48" width="60" height="12" rx="0" fill="#2E7991" />
    {/* Water ripples */}
    <circle cx="24" cy="53" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <circle cx="36" cy="53" r="1.5" fill="#FFFFFF" opacity="0.8" />
  </svg>
);

/**
 * 18:00 Campuhan Ridge Sunset Icon
 * Green ridge trail under glowing dusk sun
 */
export const CampuhanRidgeIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <svg
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`rounded-2xl shrink-0 ${className}`}
  >
    {/* Soft dusk sky */}
    <rect width="60" height="60" rx="14" fill="#FDEAE3" />

    {/* Evening Sun */}
    <circle cx="32" cy="27" r="9" fill="#E85D3F" />

    {/* Grassy ridge hill */}
    <path
      d="M7 47 C16 38 35 38 53 47 L53 54 C53 57 50 60 47 60 L13 60 C10 60 7 57 7 54 Z"
      fill="#2A7352"
    />
    <path
      d="M0 50 C12 43 45 43 60 52 L60 60 L0 60 Z"
      fill="#1E523A"
      opacity="0.9"
    />

    {/* Ridge footpath dots */}
    <path
      d="M12 51 L48 51"
      stroke="#FAF7F2"
      strokeWidth="1.2"
      strokeDasharray="2 2"
      opacity="0.75"
    />
  </svg>
);

/**
 * Checkout Flight Icon
 * Indigo round-trip plane in soft blue background
 */
export const CheckoutFlightIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <div
    className={`rounded-2xl flex items-center justify-center bg-[#E8F0FE] text-[#1A56DB] shrink-0 ${className}`}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-7 h-7 -rotate-12"
    >
      <path d="M22 2L11 13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  </div>
);

/**
 * Checkout Villa Icon
 * Balinese villa / temple silhouette in soft peach
 */
export const CheckoutVillaIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <div
    className={`rounded-2xl flex items-center justify-center bg-[#FDEEE9] overflow-hidden shrink-0 ${className}`}
  >
    <svg viewBox="0 0 60 60" fill="none" className="w-14 h-14">
      <rect width="60" height="60" fill="#FDEEE9" />
      <circle cx="30" cy="27" r="11" fill="#D95338" opacity="0.9" />
      <polygon points="30,17 21,41 39,41" fill="#182346" />
      <rect x="18" y="41" width="24" height="4" fill="#182346" />
      <rect y="45" width="60" height="15" fill="#267087" />
      <path
        d="M20 52 C24 50 36 50 40 52"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  </div>
);

/**
 * Checkout Activities Icon
 * Rice terraces / surf
 */
export const CheckoutActivitiesIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <div
    className={`rounded-2xl flex items-center justify-center bg-[#E7F3ED] overflow-hidden shrink-0 ${className}`}
  >
    <svg viewBox="0 0 60 60" fill="none" className="w-14 h-14">
      <rect width="60" height="60" fill="#E7F3ED" />
      <circle cx="46" cy="18" r="4" fill="#D95338" />
      <rect x="8" y="26" width="44" height="6" rx="3" fill="#48BB78" />
      <rect x="8" y="33" width="44" height="6" rx="3" fill="#38A169" />
      <rect x="8" y="40" width="44" height="6" rx="3" fill="#2F855A" />
      <rect x="8" y="47" width="44" height="6" rx="3" fill="#22543D" />
    </svg>
  </div>
);

/**
 * Checkout Dining Icon
 * Bowl with aroma steam
 */
export const CheckoutDiningIcon: React.FC<IconProps> = ({ className = 'w-14 h-14' }) => (
  <div
    className={`rounded-2xl flex items-center justify-center bg-[#FDF0DF] overflow-hidden shrink-0 ${className}`}
  >
    <svg viewBox="0 0 60 60" fill="none" className="w-14 h-14">
      <rect width="60" height="60" fill="#FDF0DF" />
      <path
        d="M6 46 C16 43 44 43 54 46 L54 60 L6 60 Z"
        fill="#D49A58"
      />
      <path
        d="M20 28 H40 V38 C40 41 38 43 35 43 H25 C22 43 20 41 20 38 V28 Z"
        fill="#6B4527"
      />
      <path
        d="M26 21 C25 17 27 15 26 12"
        stroke="#D95338"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M34 21 C33 17 35 15 34 12"
        stroke="#D95338"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </div>
);
