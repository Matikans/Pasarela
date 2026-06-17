'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  useEffect(() => {
    const registrarComercio = async () => {
      try {
        const response = await fetch('/api/comercios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',},
          body: JSON.stringify({
            email: user?.google?.email,
            walletAddress: user?.wallet?.address
          })
        });
        const data = await response.json();
        console.log(data);
      }catch(error) {
        console.error('Error al registrar comercio:', error);
      }
    }
    if (authenticated) {
      registrarComercio();
    }
  }, [authenticated, user]);
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <p className="text-lg animate-pulse">Cargando entorno seguro...</p>
      </div>
    );
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Ventyum
        </h1>
        <p className="text-gray-400 text-sm">
          Gestor de ventas y cobros libres sobre Base.
        </p>

        <hr className="border-gray-800" />
        {!authenticated ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Iniciá sesión para generar tu billetera comercial invisible.
            </p>
            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/30 active:scale-[0.98]"
            >
              Ingresar con Google
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-2">
              <p className="text-xs text-gray-400 font-mono">
                <span className="text-blue-400 font-semibold">Usuario:</span> {user?.google?.email || 'Desconocido'}
              </p>
              <p className="text-xs text-gray-400 font-mono truncate">
                <span className="text-emerald-400 font-semibold">Billetera Base:</span> {user?.wallet?.address}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-2 px-4 rounded-xl transition-all text-sm"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </main>
  );
}