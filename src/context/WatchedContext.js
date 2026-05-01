import { createContext, useContext, useState, useCallback } from 'react';

const WatchedContext = createContext({ watchedIds: new Set(), markWatched: () => {} });

export function WatchedProvider({ children }) {
  const [watchedIds, setWatchedIds] = useState(
    () => new Set(JSON.parse(localStorage.getItem('watched-ids') || '[]'))
  );

  const markWatched = useCallback((id) => {
    setWatchedIds(prev => {
      if (prev.has(String(id))) return prev;
      const next = new Set(prev);
      next.add(String(id));
      localStorage.setItem('watched-ids', JSON.stringify([...next]));
      return next;
    });
  }, []);

  return (
    <WatchedContext.Provider value={{ watchedIds, markWatched }}>
      {children}
    </WatchedContext.Provider>
  );
}

export const useWatched = () => useContext(WatchedContext);
