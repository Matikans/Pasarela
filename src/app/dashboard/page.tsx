"use client";

import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { DollarSign, PlusCircle, Clock, CheckCircle, Link as LinkIcon, Loader2 } from 'lucide-react';

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

  if (!ready || (authenticated && fetching)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-600 font-medium">Cargando tu panel de control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Panel de Control ⚡</h1>
            <p className="text-sm text-slate-500">Usuario: <span className="font-medium text-slate-700">{userEmail}</span></p>
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-mono text-slate-600 border border-slate-200">
            ID Cuenta: {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Generando...'}
          </div>
        </div>

        {/* Grilla Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna de Gestión Lateral */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Balance */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md border border-slate-700">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Fondos Disponibles</p>
              <h2 className="text-4xl font-black mt-1 tracking-tight">
                ${totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg font-medium text-slate-400">USD</span>
              </h2>
              <p className="text-xs text-green-400 mt-4 flex items-center gap-1">● Cuenta protegida</p>
            </div>

            {/* Formulario de Cobros con React 19 Form Actions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" /> Solicitar un Pago
              </h3>
              
              {/* 🚀 Usamos action en lugar de onSubmit */}
              <form action={handleCreatePaymentAction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monto a cobrar (USD)</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="number" step="0.01" required name="amount"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Concepto / Descripción</label>
                  <input
                    type="text" name="concept"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Ej: Venta de producto"
                  />
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-medium shadow transition text-sm"
                >
                  {loading ? "Generando..." : "Generar Orden de Pago"}
                </button>
              </form>

              {/* Enlace generado */}
              {generatedLink && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center space-y-2 mt-2 animate-fade-in">
                  <p className="text-xs font-bold text-green-800 uppercase tracking-wider">¡Link de pago listo!</p>
                  <p className="text-xs text-slate-600 font-mono break-all bg-white p-2 rounded border">{generatedLink}</p>
                  <button 
                    onClick={() => navigateTo(`/pay/${generatedLink.split('/').pop()}`)}
                    className="w-full bg-slate-800 text-white text-xs py-2 rounded-lg font-medium hover:bg-slate-900 transition flex items-center justify-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" /> Ver Pantalla de Cobro
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Historial de Operaciones */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Registro de Ventas</h3>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12 my-auto">
                <p className="text-sm text-slate-400">No registrás movimientos en esta cuenta todavía.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Detalle</th>
                      <th className="pb-3">Monto</th>
                      <th className="pb-3">Estado</th>
                      <th className="pb-3 text-right">Enlace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 font-medium text-slate-800">{tx.concept}</td>
                        <td className="py-3.5 font-bold text-slate-900">${tx.amount.toFixed(2)} USD</td>
                        <td className="py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            tx.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {tx.status === 'completed' ? 'Acreditado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => navigateTo(`/pay/${tx.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-xs"
                          >
                            <LinkIcon className="w-3 h-3" /> Ver Cobro
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}