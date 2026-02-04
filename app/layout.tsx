import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModoFoco",
  description: "Cinematic Dark Experience",
  manifest: "/manifest.json",
};

import { FalconFloatingButton } from "@/components/falcon/FalconFloatingButton";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <IntroAnimation>
          <ServiceWorkerRegister />
          <GlobalDataProvider>
            <AppShell>
              {children}
            </AppShell>
            <FalconFloatingButton />
          </GlobalDataProvider>
        </IntroAnimation>
      </body>
    </html>
  );
}
