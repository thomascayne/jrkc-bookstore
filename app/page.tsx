// app/page.tsx

'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useSearchStore } from '@/stores/searchStore';
import { Button } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import router from 'next/router';
import { Suspense } from 'react';
import { Spinner } from "@nextui-org/react";
import LandingPageContent from '@/components/LandingPageContent';

export default function Index() {
  const { profile, access_token } = useUserProfile();

  return (
    <section className="page-wrapper flex flex-col flex-grow items-center h-full">
      <div className="main-page-container flex flex-col flex-grow h-full items-center py-10">
        <Suspense fallback={<Spinner size="lg" />}>
          <LandingPageContent />
        </Suspense>
      </div>
    </section>
  );
}
