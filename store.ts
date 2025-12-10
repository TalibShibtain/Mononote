import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Note, Settings } from './types';

const DEFAULT_SETTINGS: Settings = {
  timerDuration: 300, // 5 minutes default
  theme: 'light',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      notes: [],
      settings: DEFAULT_SETTINGS,
      addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
      updateNote: (id, content, title) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { 
              ...n, 
              content,
              title: title !== undefined ? title : n.title 
            } : n
          ),
        })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      getNote: (id) => get().notes.find((n) => n.id === id),
    }),
    {
      name: 'mononote-storage',
    }
  )
);