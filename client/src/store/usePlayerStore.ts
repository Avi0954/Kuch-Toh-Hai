import { create } from 'zustand';
import { PlayerState, Track } from '@kuch-toh-hai/shared';

interface PlayerStore extends PlayerState {
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  setProgress: (ms: number) => void;
  setVolume: (level: number) => void;
  setStatus: (status: PlayerState['status']) => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  progressMs: 0,
  durationMs: 0,
  volume: 100,
  isMuted: false,
  status: 'IDLE',

  play: (track) => set({ currentTrack: track, isPlaying: true, status: 'PLAYING', progressMs: 0, durationMs: track.durationMs }),
  pause: () => set({ isPlaying: false, status: 'PAUSED' }),
  resume: () => set({ isPlaying: true, status: 'PLAYING' }),
  setProgress: (progressMs) => set({ progressMs }),
  setVolume: (volume) => set({ volume }),
  setStatus: (status) => set({ status }),
}));
