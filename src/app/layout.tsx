import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HyperUtil",
    template: "%s · HyperUtil",
  },
  description:
    "Compare impressoras 3D, insumos e acessórios com duelos, rankings e um recomendador objetivo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {/* Adicionado para rastrear visitas e origens globalmente sem conflitos */}
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>

        {children}
      </body>
    </html>
  );
}