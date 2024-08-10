// components/PageTracker.tsx

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTracker() {
  const pathname = usePathname() as string;

  useEffect(() => {
    if (pathname !== '/signin' && pathname !== '/signup') {
      localStorage.setItem('lastVisitedPage', pathname);
    }
  }, [pathname]);

  // This component doesn't render anything
  return null; 
}