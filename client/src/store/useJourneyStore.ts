import { create } from 'zustand';

export type JourneyPhase = 'opening' | 'title_reveal' | 'atmospheric_transition' | 'discovery' | 'playing' | 'ambient_closing';

interface JourneyStore {
  phase: JourneyPhase;
  setPhase: (phase: JourneyPhase) => void;
  // We can add variables like dynamic background color based on mood
  ambientColor: string;
  setAmbientColor: (color: string) => void;
}

export const useJourneyStore = create<JourneyStore>((set) => ({
  phase: 'opening',
  setPhase: (phase) => set({ phase }),
  ambientColor: '#1a1311', // Deep warm evening base
  setAmbientColor: (color) => set({ ambientColor: color }),
}));
