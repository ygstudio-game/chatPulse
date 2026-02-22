import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { SyncUser } from "@/components/auth/sync-user";
import { PresenceProvider } from "@/components/providers/presence-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ClientLayoutWrapper } from "@/components/providers/client-layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulse | Real-time Messaging",
  description: "A premium real-time messaging application.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="pulse-theme"
        >
          <ConvexClientProvider>
            <PresenceProvider>
              <SyncUser />
              <ClientLayoutWrapper>
                {children}
              </ClientLayoutWrapper>
            </PresenceProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
