import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * Local learner profiles. There are no accounts: progress lives in this browser's storage, so two
 * people sharing a phone used to share one streak and one set of finished lessons. A profile gives
 * each person their own progress key; the progress store reads the active id to pick its key.
 */
export interface Profile { id: string; name: string; emoji: string; createdAt: number }

interface State { active: string; list: Profile[] }
interface Actions {
  add: (name: string, emoji: string) => Profile;
  rename: (id: string, name: string, emoji: string) => void;
  remove: (id: string) => void;
  setActive: (id: string) => void;
}

/** The profile that owns the original, pre-profiles save — it keeps the old storage key. */
export const DEFAULT_PROFILE_ID = 'default';
export const PROFILE_EMOJI = ['🦊', '🐼', '🦉', '🐙', '🦋', '🐬', '🦁', '🐸', '🦄', '🐧', '🐝', '🌱'];
export const MAX_PROFILES = 8;

/** localStorage when it works, an in-memory map when it is blocked (private mode, some webviews). */
export const safeStorage = (() => {
  try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return localStorage; }
  catch { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; }
})();

/** Storage key holding a profile's progress. The default profile keeps the legacy key. */
export const progressKeyFor = (id: string, base = 'aha-progress') => (id === DEFAULT_PROFILE_ID ? base : `${base}:${id}`);

export const useProfiles = create<State & Actions>()(
  persist(
    (set, get) => ({
      active: DEFAULT_PROFILE_ID,
      list: [{ id: DEFAULT_PROFILE_ID, name: 'Me', emoji: '🦊', createdAt: 0 }],
      add: (name, emoji) => {
        const p: Profile = { id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: name.trim() || 'Learner', emoji, createdAt: Date.now() };
        set((s) => ({ list: [...s.list, p] }));
        return p;
      },
      rename: (id, name, emoji) => set((s) => ({ list: s.list.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name, emoji } : p)) })),
      remove: (id) => {
        if (get().list.length <= 1) return;
        try { safeStorage.removeItem(progressKeyFor(id)); } catch { /* storage unavailable */ }
        set((s) => ({ list: s.list.filter((p) => p.id !== id), active: s.active === id ? s.list.find((p) => p.id !== id)!.id : s.active }));
      },
      setActive: (id) => { if (get().list.some((p) => p.id === id)) set({ active: id }); },
    }),
    { name: 'aha-profiles', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);

export const activeProfile = (s: State) => s.list.find((p) => p.id === s.active) ?? s.list[0];
