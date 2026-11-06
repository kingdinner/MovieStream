'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StringIdArrayStorageSchema,
  WatchlistItemsStorageSchema,
  type MediaItem,
} from '@/lib/schemas';

const WATCHED_STORAGE_KEY = 'watched-ids';
const MYLIST_IDS_STORAGE_KEY = 'mylist-ids';
const MYLIST_ITEMS_STORAGE_KEY = 'mylist-items';

interface ActivePlaybackState {
  item: MediaItem;
  season: number;
  episode: number;
}

interface StreamingContextValue {
  watchedIds: Set<string>;
  markWatched: (id: number | string) => void;
  isWatched: (id: number | string) => boolean;
  myListIds: Set<number>;
  myListItems: MediaItem[];
  toggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: (id: number) => boolean;
  toast: string | null;
  showToast: (message: string) => void;
  selectedItem: MediaItem | null;
  openDetailsModal: (item: MediaItem) => void;
  activePlayback: ActivePlaybackState | null;
  openPlayerModal: (item: MediaItem, season?: number, episode?: number) => void;
  closeModals: () => void;
}

const StreamingContext = createContext<StreamingContextValue | null>(null);

function safeReadLocalStorage<T>(
  key: string,
  parser: (raw: unknown) => T,
  fallback: T
): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsedJson: unknown = JSON.parse(raw);
    return parser(parsedJson);
  } catch {
    return fallback;
  }
}

export function StreamingProvider({ children }: { children: React.ReactNode }) {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [myListIds, setMyListIds] = useState<Set<number>>(new Set());
  const [myListItems, setMyListItems] = useState<MediaItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [activePlayback, setActivePlayback] = useState<ActivePlaybackState | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate persisted state safely from localStorage on client mount
  useEffect(() => {
    const loadedWatched = safeReadLocalStorage(
      WATCHED_STORAGE_KEY,
      (raw) => {
        const res = StringIdArrayStorageSchema.safeParse(raw);
        return res.success ? new Set(res.data) : new Set<string>();
      },
      new Set<string>()
    );
    setWatchedIds(loadedWatched);

    const loadedItems = safeReadLocalStorage(
      MYLIST_ITEMS_STORAGE_KEY,
      (raw) => {
        const res = WatchlistItemsStorageSchema.safeParse(raw);
        return res.success ? res.data : [];
      },
      [] as MediaItem[]
    );

    const loadedIds = safeReadLocalStorage(
      MYLIST_IDS_STORAGE_KEY,
      (raw) => {
        const res = StringIdArrayStorageSchema.safeParse(raw);
        if (!res.success) return new Set<number>();
        return new Set(
          res.data.map((id) => Number(id)).filter((n) => Number.isInteger(n) && n > 0)
        );
      },
      new Set<number>()
    );

    // Ensure IDs and items stay synchronized
    if (loadedItems.length > 0 && loadedIds.size === 0) {
      setMyListIds(new Set(loadedItems.map((i) => i.id)));
    } else {
      setMyListIds(loadedIds);
    }
    setMyListItems(loadedItems);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2400);
  }, []);

  const markWatched = useCallback((id: number | string) => {
    const strId = String(id);
    setWatchedIds((prev) => {
      if (prev.has(strId)) return prev;
      const next = new Set(prev);
      next.add(strId);
      try {
        window.localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  }, []);

  const isWatched = useCallback(
    (id: number | string) => watchedIds.has(String(id)),
    [watchedIds]
  );

  const toggleWatchlist = useCallback(
    (item: MediaItem) => {
      setMyListIds((prev) => {
        const next = new Set(prev);
        const exists = next.has(item.id);
        if (exists) {
          next.delete(item.id);
          setMyListItems((items) => {
            const updated = items.filter((i) => i.id !== item.id);
            try {
              window.localStorage.setItem(MYLIST_ITEMS_STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // Ignore storage quota errors
            }
            return updated;
          });
          showToast('Removed from My List');
        } else {
          next.add(item.id);
          setMyListItems((items) => {
            const updated = [...items.filter((i) => i.id !== item.id), item];
            try {
              window.localStorage.setItem(MYLIST_ITEMS_STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // Ignore storage quota errors
            }
            return updated;
          });
          showToast('Added to My List ✓');
        }
        try {
          window.localStorage.setItem(MYLIST_IDS_STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          // Ignore storage quota errors
        }
        return next;
      });
    },
    [showToast]
  );

  const isInWatchlist = useCallback((id: number) => myListIds.has(id), [myListIds]);

  const openDetailsModal = useCallback((item: MediaItem) => {
    setActivePlayback(null);
    setSelectedItem(item);
  }, []);

  const openPlayerModal = useCallback(
    (item: MediaItem, season = 1, episode = 1) => {
      setSelectedItem(item);
      setActivePlayback({ item, season, episode });
      markWatched(item.id);
    },
    [markWatched]
  );

  const closeModals = useCallback(() => {
    setSelectedItem(null);
    setActivePlayback(null);
  }, []);

  // Global Escape key handler to close modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModals();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeModals]);

  const value = useMemo<StreamingContextValue>(
    () => ({
      watchedIds,
      markWatched,
      isWatched,
      myListIds,
      myListItems,
      toggleWatchlist,
      isInWatchlist,
      toast,
      showToast,
      selectedItem,
      openDetailsModal,
      activePlayback,
      openPlayerModal,
      closeModals,
    }),
    [
      watchedIds,
      markWatched,
      isWatched,
      myListIds,
      myListItems,
      toggleWatchlist,
      isInWatchlist,
      toast,
      showToast,
      selectedItem,
      openDetailsModal,
      activePlayback,
      openPlayerModal,
      closeModals,
    ]
  );

  return (
    <StreamingContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="toast-notification"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-white text-black px-6 py-2.5 rounded-full font-semibold text-sm shadow-2xl pointer-events-none whitespace-nowrap"
        >
          {toast}
        </div>
      )}
    </StreamingContext.Provider>
  );
}

export function useStreaming(): StreamingContextValue {
  const ctx = useContext(StreamingContext);
  if (!ctx) {
    throw new Error('useStreaming must be used within a StreamingProvider');
  }
  return ctx;
}
