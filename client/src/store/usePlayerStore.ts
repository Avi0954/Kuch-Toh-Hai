import { create } from 'zustand';
import type { PlayerState } from '@kuch-toh-hai/shared';

interface PlayerStore extends PlayerState {
  updateState: (state: Partial<PlayerState>) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  queue: [],
  currentIndex: -1,
  currentTrack: null,
  isPlaying: false,
  progressMs: 0,
  durationMs: 0,
  status: 'IDLE',
  playerReady: false,
  errorMessage: undefined,

  updateState: (partialState) => set((state) => ({ ...state, ...partialState })),
}));
