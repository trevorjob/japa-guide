import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Japaguide - Your Migration Companion",
  description:
    "Plan your migration journey with AI-powered roadmaps, cost calculators, and personalized guidance. Make your dream of living abroad a reality.",
  keywords: "migration, visa, relocation, immigration, travel, expat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientLayout>
          <main className="min-h-screen">{children}</main>
        </ClientLayout>
      </body>
    </html>
  );
}
