"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

// Dirección del contrato de USDC en Base Sepolia
const USDC_CONTRACT = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
// RPC público de Base Sepolia para consultar la blockchain
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

export function useDashboard() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');
  
  // 🚀 Nuevo estado para el balance blockchain real en USDC
  const [totalBalance, setTotalBalance] = useState<number>(0);

  const userEmail = user?.email?.address || user?.google?.email;
  const walletAddress = user?.wallet?.address;

  // 🔄 Función para consultar el balance real de USDC en la blockchain
  const fetchBlockchainBalance = async (address: string) => {
    try {
      if (!address) return;

      // 1. Limpiamos y formateamos la dirección para que cumpla los 32 bytes exactos que pide el RPC
      const cleanAddress = address.replace("0x", "").toLowerCase();
      const paddedAddress = cleanAddress.padStart(64, '0');
      // Prefijo de la función ERC-20 balanceOf(address) -> 0x70a08231
      const dataParam = `0x70a08231${paddedAddress}`;

      console.log("🔍 Consultando balance para la wallet:", address);

      const res = await fetch(BASE_SEPOLIA_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: USDC_CONTRACT,
              data: dataParam,
            },
            "latest",
          ],
        }),
      });

      const json = await res.json();
      console.log("📦 Respuesta cruda de la Blockchain:", json);
      
      if (json.error) {
        console.error("❌ Error devuelto por el nodo RPC:", json.error.message);
        return;
      }

      if (json.result && json.result !== "0x" && json.result !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        const rawBalance = BigInt(json.result);
        const formattedBalance = Number(rawBalance) / 1_000_000;
        
        console.log("💰 ¡Balance procesado con éxito! Total:", formattedBalance);
        setTotalBalance(formattedBalance);
      } else {
        console.log("ℹ️ La blockchain respondió, pero el saldo de este token es 0.");
        setTotalBalance(0);
      }
    } catch (err) {
      console.error("🚨 Error de red o parseo al consultar la blockchain:", err);
    }
  };

  const fetchTransactions = async () => {
    if (!userEmail) {
      setFetching(false);
      return;
    }

    try {
      const res = await fetch(`/api/transactions?email=${userEmail}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Error cargando transacciones:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (ready) {
      if (authenticated) {
        fetchTransactions();
        
        // ⚡ Si el usuario ya tiene su billetera creada, traemos el saldo real
        if (walletAddress) {
          fetchBlockchainBalance(walletAddress);
        }
      } else {
        setFetching(false);
        router.push('/');
      }
    }
  }, [ready, authenticated, walletAddress]); // Escucha cambios de la wallet por si tarda en generarse

  const handleCreatePaymentAction = async (formData: FormData) => {
    if (!userEmail) return;

    const amountRaw = formData.get('amount');
    const conceptRaw = formData.get('concept');

    if (!amountRaw) return;
    
    setLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: parseFloat(amountRaw as string), 
          concept: conceptRaw as string || 'Venta general', 
          userEmail 
        }),
      });

      const data = await response.json();
      if (data.success) {
        const link = `${window.location.origin}/pay/${data.transaction.id}`;
        setGeneratedLink(link);
        await fetchTransactions();
        // Opcional: Re-consultar balance por si hubo movimientos inmediatos
        if (walletAddress) fetchBlockchainBalance(walletAddress);
      }
    } catch (error) {
      console.error('Error creando el cobro:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ready,
    authenticated,
    userEmail,
    walletAddress,
    transactions,
    loading,
    fetching,
    generatedLink,
    totalBalance, // Ahora devuelve el estado con datos reales de Base Sepolia
    handleCreatePaymentAction,
    navigateTo: router.push,
  };
}