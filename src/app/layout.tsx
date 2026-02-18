import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ErrorBoundary } from "@/components/shared";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "TrustlessID - Decentralized Digital Identity",
  description: "Own your identity. Trust no one. AI-powered decentralized identity platform with blockchain-backed credentials.",
  keywords: ["digital identity", "blockchain", "AI verification", "decentralized", "privacy"],
  authors: [{ name: "TrustlessID Team" }],
  openGraph: {
    title: "TrustlessID - Decentralized Digital Identity",
    description: "AI-powered decentralized identity platform with blockchain-backed credentials.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
