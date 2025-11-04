import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import FooterWrapper from "@/components/FooterWrapper";
import DelayedLoginModal from "@/components/DelayedLoginModal";
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "शुभ विवाह - Find Your Perfect Life Partner",
  description: "A trusted matrimonial platform for finding your perfect life partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <Navbar />
          <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 text-white">
            {children}
          </main>
          <FooterWrapper />
          <DelayedLoginModal />
        </LanguageProvider>
      </body>
    </html>
  );
}  