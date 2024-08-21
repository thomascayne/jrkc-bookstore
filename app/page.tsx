// app/page.tsx

'use client';

import { Suspense } from 'react';
import { Spinner } from "@nextui-org/react";
import LandingPageContent from '@/components/LandingPageContent';

export default function Index() {

  return (
    <section className="page-wrapper flex flex-col flex-grow items-center h-full">
      <div className="main-page-container w-full flex flex-col flex-grow h-full items-center pt-0 pb-10">
        <Suspense fallback={<Spinner size="lg" />}>
          <LandingPageContent />
        </Suspense>
      </div>
    </section>
  );
}
