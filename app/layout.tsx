// app/layout.tsx

import AuthNavbar from "@/components/AuthNavbar";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";

import packageInfo from "../package.json";

import "./globals.css";

export const metadata: Metadata = {
  title: packageInfo?.appName || "JRKC Bookstore",
  description:
    packageInfo?.description ||
    "Bookstore Management System for CTU University",
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
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
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
      <body className="flex flex-col pt-[75px] min-h-screen">
        <AuthNavbar initialUser={user} />

        <main className="flex flex-col flex-grow h-full relative">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
