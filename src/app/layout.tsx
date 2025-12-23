import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui";
import { Inter, JetBrains_Mono } from "next/font/google";

const sans = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Alex - Portfolio",
  description: "Портфолио, кейсы и контакты.",
  openGraph: {
    title: "Alex - Portfolio",
    description: "Портфолио, кейсы и контакты.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-premium flex flex-col relative">
        <div className="noise" />
        <Header />
        <main className="relative flex-1">
          <Container>{children}</Container>
        </main>
        <Footer />
      </body>

    </html>
  );
}
