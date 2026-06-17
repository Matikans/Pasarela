'use client';

import { PrivyProvider } from '@privy-io/react-auth';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PrivyProvider
          appId={appId}
          config={{
            // Definimos que el login sea principalmente con Google
            loginMethods: ['google'],
            // Le indicamos que cree automáticamente una billetera integrada (embedded) si el usuario no tiene una
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'users-without-wallets',
            }
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}