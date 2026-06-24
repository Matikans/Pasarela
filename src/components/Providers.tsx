'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { baseSepolia } from 'viem/chains';

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#3b82f6', // Un azul estético tipo Tailwind / Base
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia],
        loginMethods: ['google'],
        embeddedWallets: {
          ethereum: {createOnLogin: 'users-without-wallets'},
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
