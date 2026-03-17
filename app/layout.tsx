import type { Metadata } from "next";
import { Sora } from "next/font/google";
import { InstagramDataProvider } from "@/context/instagram-data-context";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Instagram Export Viewer",
  description: "Browse and download your Instagram data export with a beautiful UI",
  icons: {
    icon: "/logo-instagram-export.svg",
    shortcut: "/logo-instagram-export.svg",
    apple: "/logo-instagram-export.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sora.variable} min-h-screen font-[var(--font-sora)] antialiased`}>
        <InstagramDataProvider>{children}</InstagramDataProvider>
      </body>
    </html>
  );
}
