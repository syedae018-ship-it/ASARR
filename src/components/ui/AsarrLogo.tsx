'use client';

import Image from 'next/image';

interface AsarrLogoProps {
  variant?: 'burgundy' | 'white' | 'cream' | 'auto';
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function AsarrLogo({
  variant = 'auto',
  className = '',
  width = 160,
  height = 48,
  priority = false,
}: AsarrLogoProps) {
  const src =
    variant === 'burgundy'
      ? '/images/brand/asarr_logo_burgundy.png'
      : variant === 'cream'
      ? '/images/brand/asarr_logo_cream_text.png'
      : '/images/brand/asarr_logo_white.png';

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      <Image
        src={src}
        alt="ASARR"
        width={width}
        height={height}
        priority={priority}
        className="w-auto h-full object-contain select-none"
      />
    </div>
  );
}
