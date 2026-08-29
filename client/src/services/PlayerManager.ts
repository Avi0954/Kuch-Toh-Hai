import { Track } from '@kuch-toh-hai/shared';
import { usePlayerStore } from '../store/usePlayerStore';

class PlayerManagerService {
  private ytPlayer: any = null;
  private progressInterval: number | null = null;
  private errorTimeout: number | null = null;

  // Link the YouTube iframe instance to the manager
  public attachPlayer(playerInstance: any) {
    this.ytPlayer = playerInstance;
    usePlayerStore.getState().updateState({ playerReady: true });
    
    // Apply initial volume
    const state = usePlayerStore.getState();
    this.ytPlayer.setVolume(state.isMuted ? 0 : state.volume);
  }

  public loadQueue(tracks: Track[], startIndex: number = 0) {
    if (tracks.length === 0) return;
    
    usePlayerStore.getState().updateState({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex],
      durationMs: tracks[startIndex].durationMs,
      progressMs: 0,
      status: 'LOADING',
      isPlaying: true, // Auto-play when loading a new queue
    });
  }

  public play() {
    if (this.ytPlayer && usePlayerStore.getState().currentTrack) {
      this.ytPlayer.playVideo();
      usePlayerStore.getState().updateState({ isPlaying: true, status: 'PLAYING' });
      this.startProgressTracking();
    }
  }

  public pause() {
    if (this.ytPlayer) {
      this.ytPlayer.pauseVideo();
      usePlayerStore.getState().updateState({ isPlaying: false, status: 'PAUSED' });
      this.stopProgressTracking();
    }
  }

  public togglePlay() {
    const state = usePlayerStore.getState();
    if (state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public next() {
    this.clearErrorRecovery();
    const state = usePlayerStore.getState();
    if (state.queue.length === 0) return;

    const nextIndex = state.currentIndex + 1;
    if (nextIndex < state.queue.length) {
      this.loadQueue(state.queue, nextIndex);
    } else {
      // Reached the end of the queue
      this.stopProgressTracking();
      usePlayerStore.getState().updateState({
        isPlaying: false,
        status: 'IDLE',
        progressMs: 0,
      });
    }
  }

  public previous() {
    this.clearErrorRecovery();
    const state = usePlayerStore.getState();
    if (state.queue.length === 0) return;

    // If we're more than 3 seconds in, restart current track
    if (state.progressMs > 3000 && this.ytPlayer) {
      this.seek(0);
      return;
    }

    const prevIndex = Math.max(0, state.currentIndex - 1);
    this.loadQueue(state.queue, prevIndex);
  }

  public seek(ms: number) {
    if (this.ytPlayer) {
      this.ytPlayer.seekTo(ms / 1000, true);
      usePlayerStore.getState().updateState({ progressMs: ms });
    }
  }

  public setVolume(level: number) {
    if (this.ytPlayer) {
      this.ytPlayer.setVolume(level);
    }
    usePlayerStore.getState().updateState({ volume: level, isMuted: level === 0 });
  }

  public toggleMute() {
    const state = usePlayerStore.getState();
    const newMuted = !state.isMuted;
    if (this.ytPlayer) {
      if (newMuted) {
        this.ytPlayer.setVolume(0);
      } else {
        this.ytPlayer.setVolume(state.volume);
      }
    }
    usePlayerStore.getState().updateState({ isMuted: newMuted });
  }

  // --- YouTube Event Handlers ---

  public onStateChange(eventData: number) {
    // 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = video cued
    switch (eventData) {
      case 0: // Ended
        this.next(); // Auto-progress!
        break;
      case 1: // Playing
        this.clearErrorRecovery();
        usePlayerStore.getState().updateState({ status: 'PLAYING', isPlaying: true });
        this.startProgressTracking();
        break;
      case 2: // Paused
        usePlayerStore.getState().updateState({ status: 'PAUSED', isPlaying: false });
        this.stopProgressTracking();
        break;
      case 3: // Buffering
        usePlayerStore.getState().updateState({ status: 'BUFFERING' });
        break;
    }
  }

  public onError(errorData: number) {
    console.error('YouTube Player Error:', errorData);
    usePlayerStore.getState().updateState({ status: 'ERROR', isPlaying: false });
    this.stopProgressTracking();

    // Auto-skip after 3 seconds on error
    this.errorTimeout = window.setTimeout(() => {
      this.next();
    }, 3000);
  }

  // --- Internal Helpers ---

  private startProgressTracking() {
    this.stopProgressTracking();
    this.progressInterval = window.setInterval(() => {
      if (this.ytPlayer) {
        const timeSeconds = this.ytPlayer.getCurrentTime();
        if (timeSeconds !== undefined) {
          usePlayerStore.getState().updateState({ progressMs: timeSeconds * 1000 });
        }
      }
    }, 1000);
  }

  private stopProgressTracking() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private clearErrorRecovery() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }
}

export const PlayerManager = new PlayerManagerService();
