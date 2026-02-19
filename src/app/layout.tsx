import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container } from "@/components/ui";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getProjects } from "@/lib/projects";
import { CommandK } from "@/components/CommandK";

export const runtime = "nodejs";

const sans = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Alex - Portfolio",
  description: "Портфолио, кейсы и контакты.",
  openGraph: { title: "Alex - Portfolio", description: "Портфолио, кейсы и контакты.", type: "website" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const projects = await getProjects();

  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-premium flex flex-col relative">
        <div className="noise" />
        <Header />

        <CommandK projects={projects.map((p) => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
        }))} />

        <main className="relative flex-1">
          <Container>{children}</Container>
        </main>
        <Footer />
      </body>
    </html>
  );
}
