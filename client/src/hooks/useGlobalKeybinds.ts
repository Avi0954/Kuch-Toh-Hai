import { useEffect } from 'react';
import { PlayerManager } from '../services/PlayerManager';
import { usePlayerStore } from '../store/usePlayerStore';

export const useGlobalKeybinds = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const activeElement = document.activeElement;
      const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      // If we are focused on a native button, let the browser handle Space/Enter natively
      const isButton = activeElement?.tagName === 'BUTTON';
      
      if (isInput) return;

      // Ensure we only process explicitly handled keys and immediately ignore everything else
      // (like Volume Up, Volume Down, Mute, Play/Pause media keys)
      const allowedKeys = [' ', 'Spacebar', 'ArrowRight', 'ArrowLeft'];
      if (!allowedKeys.includes(e.key)) {
        return;
      }

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          // Prevent default page scroll on Space only if not on a button
          if (!isButton) {
            e.preventDefault(); 
            // Only toggle play if we actually have a track loaded
            if (usePlayerStore.getState().currentTrack) {
              PlayerManager.togglePlay();
            }
          }
          break;
          
        case 'ArrowRight':
          if (usePlayerStore.getState().currentTrack) {
            const state = usePlayerStore.getState();
            PlayerManager.seek(Math.min(state.durationMs, state.progressMs + 10000)); // Seek forward 10s
          }
          break;
          
        case 'ArrowLeft':
          if (usePlayerStore.getState().currentTrack) {
            const state = usePlayerStore.getState();
            PlayerManager.seek(Math.max(0, state.progressMs - 10000)); // Seek backward 10s
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
