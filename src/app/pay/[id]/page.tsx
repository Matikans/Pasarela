"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [txData, setTxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulamos que vamos a buscar los datos de la transacción a tu backend usando el ID de la URL
  useEffect(() => {
    // Acá en el próximo paso meteremos el fetch real a tu API GET /api/transactions/[id]
    setTimeout(() => {
      setTxData({
        id: params.id,
        amount: 15.50,
        concept: "2 Cafés + Facturas 🥐",
        status: "pending",
        merchantWallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      });
      setLoading(false);
    }, 1200);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-600 font-medium">Cargando link de pago...</p>
      </div>
    );
  }

  // Generamos un string de pago simulado para el QR (puede ser una URL o una firma Web3)
  const qrValue = `ethereum:${txData.merchantWallet}@8453/transfer?address=${txData.merchantWallet}&uint256=${txData.amount}`;

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