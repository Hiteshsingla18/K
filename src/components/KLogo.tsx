import React, { useState } from 'react';

interface KLogoProps {
  className?: string;
  badgeSize?: string;
  fallbackTextSize?: string;
  showGlow?: boolean;
}

export default function KLogo({
  className = 'h-9 w-9 object-contain rounded-full',
  badgeSize = 'h-9 w-9',
  fallbackTextSize = 'text-base font-black',
  showGlow = true
}: KLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div 
        className={`${badgeSize} rounded-full bg-[#0A192F] border-2 border-cyan-400 flex items-center justify-center text-cyan-300 ${fallbackTextSize} font-mono select-none ${
          showGlow ? 'shadow-[0_0_15px_rgba(6,182,212,0.5)]' : ''
        }`}
        title="KhananRakshak AI (K)"
      >
        K
      </div>
    );
  }

  return (
    <img
      src="/src/assets/logo.png"
      alt="K Logo"
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
