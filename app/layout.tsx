// app/layout.tsx

import './globals.css';

import AuthNavbar from '@/components/navbars/AuthNavbar';
import { CartInitializer } from '@/components/CartInitializer';
import Footer from '@/components/Footer';
import SidePanel from '@/components/SidePanel';
import { FullScreenModalProvider } from '@/contexts/FullScreenModalContext';
import { SidePanelProvider } from '@/contexts/SidePanelContext';
import TanstackQueryClientProvider from '@/providers/TanstackQueryClientProvider';
import { createClient } from '@/utils/supabase/server';
import { GeistSans } from 'geist/font/sans';
import { Metadata } from 'next';
import PageTracker from '@/components/PageTracker';

import packageInfo from '../package.json';

import { PointOfSaleProvider } from '@/contexts/PointOfSaleContext';
import { UserProfileProvider } from '@/contexts/UserProfileContext';

export const metadata: Metadata = {
  title: packageInfo?.appName || 'JRKC Bookstore',
  description:
    packageInfo?.description ||
    'Bookstore Management System for CTU University',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`${GeistSans.className}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
        `,
          }}
        />
      </head>
      <body className="body-it-self flex flex-col pt-[75px] min-h-screen">
        <TanstackQueryClientProvider>
          <UserProfileProvider>
            <FullScreenModalProvider>
              <SidePanelProvider>
                <PointOfSaleProvider>
                  <AuthNavbar initialUser={user} />
                  <CartInitializer />
                  <div className="flex flex-grow overflow-hidden">
                    <SidePanel side="left" />
                    <main className="main-page-container w-full flex flex-grow overflow-y-auto">
                      {children}
                      <PageTracker />
                    </main>
                    <SidePanel side="right" />
                  </div>
                  <Footer />
                </PointOfSaleProvider>
              </SidePanelProvider>
            </FullScreenModalProvider>
          </UserProfileProvider>
        </TanstackQueryClientProvider>
      </body>
    </html>
  );
}
