import {create} from 'zustand';
import {Note, AppSettings, SSHConnection} from '../types';
import {loadSettings, saveSettings, loadSSHConnections, saveSSHConnections} from '../utils/settings';

interface AppState {
  notes: Note[];
  settings: AppSettings;
  isLoading: boolean;
  terminalMode: boolean;
  sshConnections: SSHConnection[];

  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNoteInList: (note: Note) => void;
  removeNote: (id: number) => void;
  setSettings: (settings: AppSettings) => void;
  setLoading: (loading: boolean) => void;
  setTerminalMode: (enabled: boolean) => void;
  setSSHConnections: (connections: SSHConnection[]) => void;
  addSSHConnection: (conn: SSHConnection) => void;
  updateSSHConnection: (conn: SSHConnection) => void;
  removeSSHConnection: (id: string) => void;

  loadSettingsFromStorage: () => Promise<void>;
  saveSettingsToStorage: (settings: AppSettings) => Promise<void>;
  loadSSHConnectionsFromStorage: () => Promise<void>;
  saveSSHConnectionsToStorage: (connections: SSHConnection[]) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  notes: [],
  settings: {ttsEndpoint: '', ttsApiKey: '', ttsVoice: 'zh-CN-XiaoxiaoNeural'},
  isLoading: false,
  terminalMode: false,
  sshConnections: [],

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
  setTerminalMode: (enabled) => set({terminalMode: enabled}),
  setSSHConnections: (connections) => set({sshConnections: connections}),
  addSSHConnection: (conn) =>
    set((state) => ({sshConnections: [...state.sshConnections, conn]})),
  updateSSHConnection: (conn) =>
    set((state) => ({
      sshConnections: state.sshConnections.map((c) =>
        c.id === conn.id ? conn : c,
      ),
    })),
  removeSSHConnection: (id) =>
    set((state) => ({
      sshConnections: state.sshConnections.filter((c) => c.id !== id),
    })),

  loadSettingsFromStorage: async () => {
    const settings = await loadSettings();
    set({settings});
  },

  saveSettingsToStorage: async (settings) => {
    await saveSettings(settings);
    set({settings});
  },

  loadSSHConnectionsFromStorage: async () => {
    const connections = await loadSSHConnections();
    set({sshConnections: connections});
  },

  saveSSHConnectionsToStorage: async (connections) => {
    await saveSSHConnections(connections);
    set({sshConnections: connections});
  },
}));
