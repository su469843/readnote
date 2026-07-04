import {create} from 'zustand';
import {Note, AppSettings} from '../types';
import {loadSettings, saveSettings} from '../utils/settings';

interface AppState {
  notes: Note[];
  settings: AppSettings;
  isLoading: boolean;

  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNoteInList: (note: Note) => void;
  removeNote: (id: number) => void;
  setSettings: (settings: AppSettings) => void;
  setLoading: (loading: boolean) => void;

  loadSettingsFromStorage: () => Promise<void>;
  saveSettingsToStorage: (settings: AppSettings) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  notes: [],
  settings: {ttsEndpoint: '', ttsApiKey: '', ttsVoice: 'zh-CN-XiaoxiaoNeural'},
  isLoading: false,

  setNotes: (notes) => set({notes}),
  addNote: (note) => set((state) => ({notes: [note, ...state.notes]})),
  updateNoteInList: (note) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? note : n)),
    })),
  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
    })),
  setSettings: (settings) => set({settings}),
  setLoading: (loading) => set({isLoading: loading}),

  loadSettingsFromStorage: async () => {
    const settings = await loadSettings();
    set({settings});
  },

  saveSettingsToStorage: async (settings) => {
    await saveSettings(settings);
    set({settings});
  },
}));
