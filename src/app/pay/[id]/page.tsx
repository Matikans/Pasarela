"use client";

import React, { useState, useEffect,} from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentPage({ params }: { params: { id: string } }) {
    const resolvedParams = useParams();
    const id = resolvedParams?.id; // Aseguramos que 'id' esté disponible antes de usarlo
    console.log("ID de la URL:", id); // Debugging: Verifica que el ID se esté leyendo correctamente
    
  const [txData, setTxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  // Simulamos que vamos a buscar los datos de la transacción a tu backend usando el ID de la URL
  useEffect(() => {
    // 1. Si no hay ID todavía, no hacemos nada y esperamos a que cargue
    if (!id) return;

    async function fetchTransaction() {
      try {
        setLoading(true);
        setError(null); // Limpiamos errores previos si los hubiera
        const res = await fetch(`/api/transactions/${id}`);
        const data = await res.json();

        if (data.success && data.transaction) {
          setTxData(data.transaction);
        } else {
          setError("Transacción no encontrada o error en el servidor");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError("Error de red al intentar obtener la transacción");
      } finally {
        // 2. El bloque 'finally' asegura que pase lo que pase, deje de cargar
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [id]); // El efecto se vuelve a ejecutar si el 'id' cambia

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-600 font-medium">Cargando link de pago...</p>
      </div>
    );
  }
  console.log("txData:", txData); // Debugging: Verifica qué datos se están recibiendo

  // Generamos un string de pago simulado para el QR (puede ser una URL o una firma Web3)
// 1. Esta es la dirección del "sistema" de USDC en la red de Base (es fija, no cambia nunca)
const USDC_CONTRACT_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913";

// 2. Multiplicamos por 1.000.000 porque la blockchain no entiende puntos ni comas (ej: 10.50 pasan a ser 10500000)
const parsedAmount = Math.round(txData.amount * 1_000_000);

// 3. Tu QR real usando la wallet del comercio que tenés guardada en tu base de datos
const qrValue = `ethereum:${USDC_CONTRACT_BASE}@8453/transfer?address=${txData.author.wallet_address}&uint256=${parsedAmount}`;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center">
        
        {/* Encabezado */}
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Ventyum Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">Orden de pago segura en Base Network</p>
        
        <hr className="my-5 border-slate-100" />

        {/* Detalle del Cobro */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Concepto</p>
          <p className="text-slate-700 font-medium text-lg mb-2">{txData.concept}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total a pagar</p>
          <p className="text-3xl font-extrabold text-blue-600 tracking-tight">{txData.amount} <span className="text-xl font-bold text-slate-500">USDC</span></p>
        </div>

        {/* El Código QR Dinámico */}
        <div className="flex flex-col items-center justify-center bg-white p-4 border border-slate-100 rounded-xl shadow-inner mb-6 mx-auto w-48 h-48">
          <QRCodeSVG value={qrValue} size={160} includeMargin={false} />
        </div>

        <p className="text-xs text-slate-400 mb-6 px-4">
          Escaneá este código con tu billetera cripto (Metamask, Coinbase Wallet, etc.) o pagá directamente abajo.
        </p>

        {/* Botón de Pago directo con Privy */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2">
          <Wallet className="w-5 h-5" />
          Pagar con Billetera / Google
        </button>
        
      </div>
    </div>
  );
}