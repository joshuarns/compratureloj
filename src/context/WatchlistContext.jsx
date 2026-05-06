// ─────────────────────────────────────────────────────────────────────────────
// WATCHLISTCONTEXT.JSX
//
// Guarda los IDs de productos que el usuario marcó como favoritos.
// No requiere login — persiste en localStorage y funciona para visitantes.
//
// API expuesta:
//   watchlist      → array de IDs (números)
//   enWatchlist(id) → boolean
//   toggleWatchlist(id) → añade si no está, quita si ya está
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback } from "react";
import { STORAGE_KEY_WATCHLIST as STORAGE_KEY } from "../config/constants";

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {

  // Lazy init: lee el localStorage una sola vez al montar
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const toggleWatchlist = useCallback((id) => {
    setWatchlist(prev => {
      const siguiente = prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
      return siguiente;
    });
  }, []);

  const enWatchlist = useCallback((id) => watchlist.includes(id), [watchlist]);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggleWatchlist, enWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
