import type { Metadata } from "next";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/Toast";
import CookieBanner from "@/components/CookieBanner";

import NavBar from "@/components/NavBar";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mothers Union Buganda",
    template: "%s | Mothers Union Buganda",
  },
  description:
    "Mothers Union Buganda — supporting women, children, and families across the Buganda diocesess through faith, advocacy, and community outreach.",
  metadataBase: new URL("https://mothers-union-buganda.vercel.app"),
  openGraph: {
    title: "Mothers Union Buganda",
    description:
      "Supporting women, children, and families across the Buganda diocesess through faith, advocacy, and community outreach.",
    siteName: "Mothers Union Buganda",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  themeColor: "#0044cc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${josefin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[var(--color-text)]">
        <AuthProvider>
          <ToastProvider>
            <NavBar />
            {children}
            <CookieBanner />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
