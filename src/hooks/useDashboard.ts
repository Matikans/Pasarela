"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export function useDashboard() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generatedLink, setGeneratedLink] = useState('');

  // 🚀 Intenta leer de address, y si no existe, cae en el mail de Google
  const userEmail = user?.email?.address || user?.google?.email;
  const walletAddress = user?.wallet?.address;

  const fetchTransactions = async () => {
    // Si no hay mail, apagamos el cargando antes de salir
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
      setFetching(false); // Garantizado
    }
  };

  useEffect(() => {
    if (ready) {
      if (authenticated) {
        // Ejecutamos la función; ella se encargará de validar internamente si el mail ya existe
        fetchTransactions();
      } else {
        setFetching(false);
        router.push('/');
      }
    }
  }, [ready, authenticated]);

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
      }
    } catch (error) {
      console.error('Error creando el cobro:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    ready,
    authenticated,
    userEmail,
    walletAddress,
    transactions,
    loading,
    fetching,
    generatedLink,
    totalBalance,
    handleCreatePaymentAction,
    navigateTo: router.push,
  };
}