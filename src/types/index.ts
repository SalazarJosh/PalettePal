export interface Color {
  color: string;
  name: string | null;
}

export interface Palette {
  id: string;
  name: string;
  colors: Color[];
  gridSize: 'small' | 'medium' | 'large';
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  autoSaveEnabled: boolean;
  showWelcome: boolean;
}

export interface AppData {
  palettes: Palette[];
  currentPaletteId: string;
  autoSaveEnabled: boolean;
  lastSaved: string;
}

export interface FooterProps {
  statsText?: string;
}