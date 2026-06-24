import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Esto es lo que se rompe si usas 'use client' en el layout
export const metadata: Metadata = {
  title: "Tu Pasarela Onchain",
  description: "Procesa pagos en Base de forma simple",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Envolvemos la app con el componente de cliente que creamos */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
