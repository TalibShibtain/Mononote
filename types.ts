export interface Note {
  id: string;
  title: string;
  content: string; // Stores HTML
  createdAt: number;
  durationSeconds: number;
  isLocked: boolean;
}

export interface Settings {
  timerDuration: number; // in seconds
  theme: 'light' | 'dark';
}

export interface AppState {
  notes: Note[];
  settings: Settings;
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string, title?: string) => void;
  deleteNote: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  getNote: (id: string) => Note | undefined;
}