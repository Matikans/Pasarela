"use client";

import React, { useState } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { 
  DollarSign, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  Link as LinkIcon, 
  Loader2, 
  User, 
  ArrowUpRight, 
  QrCode, 
  History, 
  Home as HomeIcon,
  LogOut 
} from 'lucide-react';

export default function DashboardPage() {
  const {
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
    navigateTo,
  } = useDashboard();

  const [showModal, setShowModal] = useState(false);

  if (!ready || (authenticated && fetching)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="mt-4 text-slate-400 font-medium text-sm">Cargando Ventyum...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 font-sans antialiased selection:bg-blue-500/30">
      
      {/* 1. HEADER ESTILO APP */}
      <header className="px-4 pt-6 pb-2 flex justify-between items-center bg-slate-950 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <User className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Hola,</p>
            <h1 className="text-sm font-bold text-slate-200 max-w-[180px] truncate">
              {userEmail?.split('@')[0]}
            </h1>
          </div>
        </div>
        <div className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-3 py-1.5 rounded-full shadow-inner">
          {walletAddress ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}` : 'Generando...'}
        </div>
      </header>

      {/* CONTENEDOR CENTRAL (ANCHO MÁXIMO DE CELULAR PARA ESCRITORIO) */}
      <main className="max-w-md mx-auto px-4 mt-4 space-y-5">
        
        {/* 2. TARJETA DE BALANCE PRINCIPAL */}
        <section className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-blue-500/20 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20" />
          <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold opacity-80">Dinero Disponible</p>
          <div className="flex items-baseline mt-2">
            <span className="text-2xl font-medium text-blue-200 mr-1">$</span>
            <h2 className="text-4xl font-black tracking-tight">
              {totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <span className="text-xs font-bold text-blue-300 ml-2 bg-blue-900/40 px-2 py-0.5 rounded-md">USD</span>
          </div>
          <div className="mt-5 flex items-center justify-between text-xs text-blue-200 bg-blue-950/40 -mx-6 -mb-6 px-6 py-3 border-t border-blue-400/10">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Cuenta sobre Base Network
            </span>
          </div>
        </section>

        {/* 3. BOTONES DE ACCIÓN RÁPIDA (Estilo Mercado Pago) */}
        <section className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 active:scale-95 transition-all text-center group"
          >
            <div className="w-11 h-11 bg-blue-600/10 text-blue-400 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-md">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-300">Cobrar</span>
          </button>

          <button className="bg-slate-900 opacity-60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-not-allowed">
            <div className="w-11 h-11 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-400">Mi QR</span>
          </button>

          <button className="bg-slate-900 opacity-60 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-not-allowed">
            <div className="w-11 h-11 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-400">Retirar</span>
          </button>
        </section>

        {/* CONTENEDOR DE ENLACE GENERADO (Dinámico) */}
        {generatedLink && (
          <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">¡Link de cobro creado!</p>
            <p className="text-xs text-slate-300 font-mono break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center select-all">{generatedLink}</p>
            <button 
              onClick={() => navigateTo(`/pay/${generatedLink.split('/').pop()}`)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Probar Pantalla de Cobro
            </button>
          </div>
        )}

        {/* 4. LISTA DE MOVIMIENTOS (Estilo Brubank) */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold text-slate-400 px-1 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4" /> Actividad reciente
          </h3>
          
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-2 divide-y divide-slate-800/60 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <p className="text-xs">No tenés movimientos en esta cuenta.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-850/50 transition rounded-xl" onClick={() => navigateTo(`/pay/${tx.id}`)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                      tx.status === 'completed' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {tx.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{tx.concept}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-100">${tx.amount.toFixed(2)}</p>
                    <p className={`text-[9px] font-medium mt-0.5 ${tx.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {tx.status === 'completed' ? 'Acreditado' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 5. MODAL FLOTANTE DESDE ABAJO PARA COBRAR (Evita redirigir páginas) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center animate-in fade-in duration-150 p-0 sm:p-4">
          <div className="fixed inset-0" onClick={() => setShowModal(false)} />
          <div className="bg-slate-900 w-full max-w-md p-6 rounded-t-3xl border-t border-slate-800 shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 max-sm:rounded-b-none">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-5" onClick={() => setShowModal(false)} />
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-500" /> Ingresar monto a cobrar
            </h3>
            
            <form action={async (formData) => {
              await handleCreatePaymentAction(formData);
              setShowModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Monto (USD)</label>
                <div className="relative rounded-2xl shadow-inner">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="number" step="0.01" required name="amount" autoFocus
                    className="w-full pl-9 pr-4 py-3 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Concepto</label>
                <input
                  type="text" name="concept"
                  className="w-full px-4 py-3 border border-slate-800 rounded-xl bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Ej: Almuerzo, indumentaria, venta"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-750 text-slate-300 py-3 rounded-xl font-semibold transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={loading}
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white py-3 rounded-xl font-semibold transition text-xs shadow-lg shadow-blue-900/30"
                >
                  {loading ? "Creando..." : "Crear Enlace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BOTTOM NAVIGATION BAR FIJA (Estilo Nativo) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800/80 backdrop-blur-lg px-6 py-2 flex justify-around items-center z-40 max-w-md mx-auto rounded-t-2xl shadow-xl">
        <button className="flex flex-col items-center gap-1 py-1 text-blue-400">
          <HomeIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Inicio</span>
        </button>
        <button 
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center gap-1 py-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Nueva orden</span>
        </button>
      </nav>

    </div>
  );
}