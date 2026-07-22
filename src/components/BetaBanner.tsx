'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function BetaBanner() {
  const pathname = usePathname();

  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <div className="beta-banner">
      <span className="beta-banner-strong">Vichith Beta is now available.</span>
      <span>Built with creators. Improved with creators.</span>
      <div className="beta-banner-links">
        <a href="/#download">Download Beta</a>
        <a href="https://discord.gg/MSeSsbgD" target="_blank" rel="noopener noreferrer">Join Discord</a>
        <a href="/report">Report Issue</a>
      </div>
    </div>
  );
}
