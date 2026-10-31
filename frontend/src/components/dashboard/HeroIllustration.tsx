import React from 'react';

interface HeroIllustrationProps {
  className?: string;
}

export const HeroIllustration: React.FC<HeroIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Background Soft Glow & Ambient Circles */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 via-sky-100/50 to-indigo-100/40 rounded-full blur-2xl transform scale-90 -z-10 pointer-events-none" />

      {/* SVG Health & Caregiver Composition */}
      <svg
        viewBox="0 0 460 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[380px] lg:max-w-[420px] drop-shadow-sm"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle Gradients */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAF3FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D8E8FE" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#388BFD" />
            <stop offset="100%" stopColor="#1E65E5" />
          </linearGradient>

          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F0F6FE" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Organic Cloud Shape */}
        <path
          d="M70 160 C 50 110, 110 50, 190 65 C 240 30, 320 50, 340 100 C 400 90, 440 160, 410 210 C 420 270, 350 310, 270 295 C 200 320, 110 300, 90 240 C 50 230, 40 180, 70 160 Z"
          fill="url(#cloudGrad)"
        />

        {/* Floating Sparkles & Soft Cross Elements */}
        <g opacity="0.65">
          <circle cx="85" cy="80" r="3" fill="#2675F5" />
          <circle cx="100" cy="95" r="2" fill="#5F9EFA" />
          <circle cx="390" cy="70" r="3" fill="#2675F5" />
          <circle cx="410" cy="90" r="2" fill="#5F9EFA" />
          <path
            d="M75 120 h 10 M80 115 v 10"
            stroke="#94C1FC"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M380 140 h 10 M385 135 v 10"
            stroke="#94C1FC"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Character Illustration (Caring Healthcare Persona) */}
        {/* Hair Back */}
        <path
          d="M210 105 C 190 70, 310 50, 315 110 C 335 150, 330 220, 320 250 C 290 270, 260 270, 230 250 C 210 210, 200 140, 210 105 Z"
          fill="#1E293B"
        />

        {/* Torso / Scrubs / Sweater in Calming Soft Navy */}
        <path
          d="M190 280 C 195 240, 215 220, 255 215 C 295 220, 320 240, 335 280 C 300 295, 230 295, 190 280 Z"
          fill="#3B5998"
        />
        {/* Collar Line */}
        <path
          d="M245 216 C 255 230, 265 230, 275 216"
          stroke="#E2EAF8"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Neck */}
        <path d="M245 190 L 245 220 L 275 220 L 275 190 Z" fill="#F8CBA6" />

        {/* Face */}
        <path
          d="M235 140 C 235 110, 285 110, 285 140 C 285 175, 275 195, 260 195 C 245 195, 235 175, 235 140 Z"
          fill="#FBD5B5"
        />

        {/* Gentle Facial Features */}
        <path
          d="M248 145 C 250 148, 254 148, 256 145"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M266 145 C 268 148, 272 148, 274 145"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M256 160 C 259 164, 263 164, 266 160"
          stroke="#E11D48"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Soft Blush */}
        <circle cx="245" cy="155" r="4" fill="#FDA4AF" opacity="0.6" />
        <circle cx="277" cy="155" r="4" fill="#FDA4AF" opacity="0.6" />

        {/* Front Hair Strands */}
        <path
          d="M235 130 C 240 100, 275 100, 285 125 C 275 115, 255 115, 240 128 Z"
          fill="#0F172A"
        />

        {/* Arms Holding Glowing Blue Heart */}
        {/* Left Arm */}
        <path
          d="M205 250 C 215 260, 230 268, 245 265 C 240 252, 230 240, 218 238 Z"
          fill="#F8CBA6"
        />
        {/* Right Arm */}
        <path
          d="M315 250 C 305 260, 290 268, 275 265 C 280 252, 290 240, 302 238 Z"
          fill="#F8CBA6"
        />

        {/* Glowing Heart with ECG Pulse Line */}
        <g filter="url(#softGlow)">
          <path
            d="M260 230 C 260 215, 240 215, 240 230 C 240 245, 260 260, 260 265 C 260 260, 280 245, 280 230 C 280 215, 260 215, 260 230 Z"
            fill="url(#heartGrad)"
          />
          {/* ECG Pulse Line inside Heart */}
          <path
            d="M246 235 L 253 235 L 256 226 L 260 243 L 264 231 L 267 235 L 274 235"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Mini Floating Shield Badge: "Secure. Simple. Together." */}
        <g transform="translate(320, 80)">
          <rect
            x="0"
            y="0"
            width="96"
            height="52"
            rx="12"
            fill="url(#shieldGrad)"
            stroke="#C2DBFD"
            strokeWidth="1.2"
            filter="drop-shadow(0 4px 6px rgba(11, 27, 73, 0.06))"
          />
          {/* Shield Icon */}
          <path
            d="M48 10 L 40 14 V 22 C 40 27, 48 31, 48 31 C 48 31, 56 27, 56 22 V 14 Z"
            fill="#2675F5"
            opacity="0.15"
          />
          <path
            d="M48 12 L 42 15 V 21 C 42 25, 48 29, 48 29 C 48 29, 54 25, 54 21 V 15 Z"
            stroke="#2675F5"
            strokeWidth="1.5"
            fill="none"
          />
          <text
            x="48"
            y="39"
            textAnchor="middle"
            fill="#0B1B49"
            fontSize="7"
            fontWeight="bold"
            letterSpacing="0.02em"
          >
            Secure.
          </text>
          <text x="48" y="46" textAnchor="middle" fill="#526482" fontSize="6" fontWeight="medium">
            Simple. Together.
          </text>
        </g>

        {/* Handwritten Style Caption: "Your Health In Your Hands ♡" */}
        <g transform="translate(140, 290)">
          <path
            d="M-5 -8 C 15 -18, 30 -5, 50 -12 C 70 -18, 90 -8, 110 -15"
            stroke="#94C1FC"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            fill="none"
          />
          <text
            x="50"
            y="8"
            textAnchor="middle"
            fill="#1E40AF"
            fontSize="13"
            fontWeight="600"
            fontStyle="italic"
            fontFamily="cursive, Georgia, sans-serif"
            className="select-none"
          >
            Your Health In Your Hands ♡
          </text>
        </g>
      </svg>
    </div>
  );
};
