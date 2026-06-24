"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Loader2, ShieldCheck, ReceiptText } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';

// 🚨 Direcciones oficiales para Base Sepolia configuradas
const USDC_CONTRACT_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const BASE_SEPOLIA_CHAIN_ID = 84532; 

export default function PaymentPage() {
  const resolvedParams = useParams();
  const id = resolvedParams?.id;
  
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets(); // Trae las wallets activas del usuario logueado en Privy

  const [txData, setTxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchTransaction() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/transactions/${id}`);
        const data = await res.json();

        if (data.success && data.transaction) {
          setTxData(data.transaction);
        } else {
          setError("La orden de pago no existe o ya expiró.");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
        setError("Error de red al intentar obtener la transacción.");
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [id]);

  // 🚀 FUNCIÓN DEL BOTÓN: Paga directamente interactuando con el Smart Contract de USDC
  const handleDirectPayment = async () => {
    if (!authenticated) {
      // Si el cliente no está logueado, Privy abre el modal para entrar con Google/Mail en 1 click
      login();
      return;
    }

    const activeWallet = wallets[0]; // Tomamos la billetera integrada de Privy
    if (!activeWallet) {
      alert("No se encontró ninguna wallet activa de Privy.");
      return;
    }

    try {
      setPaying(true);
      
      // Aseguramos que el cliente esté parado en la red Base Sepolia
      await activeWallet.switchChain(BASE_SEPOLIA_CHAIN_ID);
      
      // Instanciamos el proveedor ethereum de esa billetera integrada
      const provider = await activeWallet.getEthereumProvider();

      // Convertimos el monto real a decimales cripto (USDC = 6 decimales)
      const parsedAmount = Math.round((txData?.amount || 0) * 1_000_000);
      const hexAmount = "0x" + parsedAmount.toString(16);
      
      // Formateamos la dirección del receptor para que sea válida en el data dataParam
      const targetAddress = txData?.author?.wallet_address;
      if (!targetAddress) throw new Error("El vendedor no tiene una wallet vinculada.");
      const cleanTarget = targetAddress.replace("0x", "").toLowerCase().padStart(64, '0');

      // Firma de la función ERC20: transfer(address,uint256) -> 0xa9059cbb
      const dataParam = `0xa9059cbb${cleanTarget}${hexAmount.replace("0x", "").padStart(64, '0')}`;

      // Enviamos la transacción directamente firmada desde la Embedded Wallet de Privy
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: activeWallet.address,
          to: USDC_CONTRACT_SEPOLIA,
          data: dataParam,
          value: '0x0', // No enviamos ETH, mandamos data del token USDC
        }],
      });

      console.log("¡Pago exitoso! Hash de transacción:", txHash);
      setPaymentSuccess(true);
      
      // Opcional: Avisar a tu API que impacte el pago como completado usando el txHash
      await fetch(`/api/transactions/${id}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash, status: 'completed' })
      });

    } catch (err: any) {
      console.error("Error procesando el pago:", err);
      alert(err?.message || "El pago fue cancelado o no pudo procesarse.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="mt-4 text-slate-400 font-medium text-sm">Cargando checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4 text-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl max-w-md shadow-xl">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const parsedAmount = Math.round((txData?.amount || 0) * 1_000_000);
  const qrValue = `ethereum:${USDC_CONTRACT_SEPOLIA}@${BASE_SEPOLIA_CHAIN_ID}/transfer?address=${txData?.author?.wallet_address || ''}&uint256=${parsedAmount}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 flex flex-col justify-center items-center font-sans antialiased">
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl opacity-10" />

        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" /> Ventyum Checkout
          </div>
          <p className="text-xs text-slate-400 pt-1">Pasarela de pago segura sobre Base Sepolia</p>
        </div>

        <hr className="my-5 border-slate-800/60" />

        {paymentSuccess ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl text-center space-y-2">
            <p className="text-sm font-bold">¡Pago Procesado Exitosamente!</p>
            <p className="text-xs text-slate-400">Los USDC se enviaron directo al comerciante en la blockchain.</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850/80 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800 text-slate-400 shrink-0 mt-0.5">
                  <ReceiptText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Concepto</span>
                  <p className="text-sm font-semibold text-slate-200 truncate mt-0.5">{txData?.concept}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-between items-baseline">
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total a pagar</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {txData?.amount?.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-blue-400 ml-1.5 bg-blue-950/60 border border-blue-900/30 px-1.5 py-0.5 rounded-md">USDC</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="bg-white p-3.5 rounded-2xl shadow-xl border-4 border-slate-950 inline-block">
                <QRCodeSVG value={qrValue} size={160} includeMargin={false} />
              </div>
              <p className="text-[11px] text-slate-400 mt-3 text-center px-6 leading-relaxed">
                Escaneá este código con tu billetera cripto nativa para pagar de forma inmediata.
              </p>
            </div>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-800/60"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ó</span>
              <div className="flex-grow border-t border-slate-800/60"></div>
            </div>

            {/* Botón interactivo modificado con el evento onClick y estados de carga */}
            <button 
              onClick={handleDirectPayment}
              disabled={paying}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-blue-900/20 text-xs flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando en Blockchain...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  {authenticated ? "Confirmar Pago en 1-Click" : "Pagar con Billetera / Web3"}
                </>
              )}
            </button>
          </>
        )}
        
      </div>
    </div>
  );
}