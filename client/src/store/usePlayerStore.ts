import { create } from 'zustand';
import { PlayerState, Track } from '@kuch-toh-hai/shared';

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
  volume: 100,
  isMuted: false,
  status: 'IDLE',
  playerReady: false,

  updateState: (partialState) => set((state) => ({ ...state, ...partialState })),
}));
