'use client';

import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  linkToHome?: boolean;
}

export default function Logo({ size = 'medium', showText = true, linkToHome = true }: LogoProps) {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 40
  };

  const logoSize = sizeMap[size];

  const LogoContent = () => (
    <div className="flex items-center gap-3">
      {/* PalettePal SVG Logo */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        id="Layer_2" 
        data-name="Layer 2" 
        viewBox="0 0 63.1 62.78"
        width={logoSize}
        height={logoSize}
        className="rounded-lg"
      >
        <defs>
          <style>
            {`
              .cls-1 { fill: #b88ee8; }
              .cls-2 { fill: #7db5e2; }
              .cls-3 { fill: #9e50ec; }
              .cls-4 { fill: #37e1e1; }
              .cls-5 { fill: #6161f0; }
              .cls-6 { fill: #328be5; }
              .cls-7 { fill: #80d8d4; }
              .cls-8 { fill: #acacea; }
            `}
          </style>
        </defs>
        <g id="Layer_1-2" data-name="Layer 1">
          <g id="Light">
            <path className="cls-4" d="M11.71,0C5.24,0,0,5.24,0,11.71v18.96h13.26c0-8.81,8.91-17.62,17.41-17.62,0-4.35,0-8.7,0-13.05H11.71Z"/>
            <path className="cls-7" d="M30.67,14.85c-7.63,0-15.63,7.91-15.63,15.82h15.63"/>
            <path className="cls-6" d="M63.1,30.67V11.71c0-6.47-5.24-11.71-11.71-11.71h-18.96v13.26c8.81,0,17.62,8.91,17.62,17.41"/>
            <path className="cls-2" d="M48.25,30.67c0-7.63-7.91-15.63-15.82-15.63v15.63"/>
            <path className="cls-3" d="M32.43,62.78h18.96c6.47,0,11.71-5.24,11.71-11.71v-18.96h-13.26c0,8.81-8.91,17.62-17.41,17.62"/>
            <path className="cls-1" d="M32.43,47.94c7.63,0,15.63-7.91,15.63-15.82h-15.63"/>
            <path className="cls-5" d="M0,32.12v18.96c0,6.47,5.24,11.71,11.71,11.71h18.96v-13.26c-8.81,0-17.62-8.91-17.62-17.41"/>
            <path className="cls-8" d="M14.85,32.12c0,7.63,7.91,15.63,15.82,15.63v-15.63"/>
          </g>
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 dark:text-white ${
            size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-2xl'
          }`}>
            PalettePal
          </span>
          {size !== 'small' && (
            <span className="text-xs text-gray-500 -mt-1">
              Your Color Palette Tool
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
