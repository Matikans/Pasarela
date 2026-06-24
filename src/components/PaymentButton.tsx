'use client';

import { useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { createWalletClient, custom, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';

export default function PaymentButton({ amount }: { amount: string }) {
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // 1. Verificar si el usuario inició sesión con Google y tiene billetera creada
    const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');

    if (!embeddedWallet) {
      alert('Por favor, inicia sesión primero');
      return;
    }

    try {
      setLoading(true);

      // 2. Solicitar el proveedor de la billetera integrada de Privy
      const provider = await embeddedWallet.getEthereumProvider();

      // 3. Crear el cliente de Viem usando el proveedor de Privy
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(provider),
      });

      // 4. Enviar la transacción de pago al contrato de tu pasarela
      const [account] = await walletClient.getAddresses();
      const hash = await walletClient.sendTransaction({
        account,
        to: '0xDireccionDeTuContratoOPasarela...', // Dirección destino del cobro
        value: parseEther(amount), // Convierte el monto (ej: "0.001") a Wei
      });

      console.log('Pago enviado con éxito. Hash de transacción:', hash);
      alert(`¡Pago exitoso! Hash: ${hash}`);

    } catch (error) {
      console.error('Error al procesar el pago:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
    >
      {loading ? 'Procesando Pago...' : `Pagar ${amount} ETH`}
    </button>
  );
}
