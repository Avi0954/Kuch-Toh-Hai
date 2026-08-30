import type { Track } from '@kuch-toh-hai/shared';
import { usePlayerStore } from '../store/usePlayerStore';

class PlayerManagerService {
  private ytPlayer: any = null;
  private progressInterval: number | null = null;
  private errorTimeout: number | null = null;

  // Link the YouTube iframe instance to the manager
  public attachPlayer(playerInstance: any) {
    this.ytPlayer = playerInstance;
    usePlayerStore.getState().updateState({ playerReady: true });
  }

  private initTimeout: number | null = null;



  public play() {
    if (this.ytPlayer && usePlayerStore.getState().currentTrack) {
      this.ytPlayer.playVideo();
      usePlayerStore.getState().updateState({ isPlaying: true, status: 'PLAYING', errorMessage: undefined });
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
    this.clearInitTimeout();
    if (this.ytPlayer) {
      this.ytPlayer.nextVideo();
    }
  }

  public previous() {
    this.clearErrorRecovery();
    this.clearInitTimeout();
    const state = usePlayerStore.getState();

    if (state.progressMs > 3000 && this.ytPlayer) {
      this.seek(0);
      return;
    }

    if (this.ytPlayer) {
      this.ytPlayer.previousVideo();
    }
  }

  public seek(ms: number) {
    if (this.ytPlayer) {
      this.ytPlayer.seekTo(ms / 1000, true);
      usePlayerStore.getState().updateState({ progressMs: ms });
    }
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
        this.clearInitTimeout();
        
        // Extract metadata dynamically
        if (this.ytPlayer && this.ytPlayer.getVideoData) {
           const videoData = this.ytPlayer.getVideoData();
           const duration = this.ytPlayer.getDuration();
           
           if (videoData && videoData.video_id) {
             const track: Track = {
               id: videoData.video_id,
               title: videoData.title,
               artist: { id: 'yt-artist', name: videoData.author },
               durationMs: (duration || 0) * 1000,
               artwork: [{ url: `https://i.ytimg.com/vi/${videoData.video_id}/maxresdefault.jpg`, width: 1280, height: 720 }]
             };
             usePlayerStore.getState().updateState({ currentTrack: track, durationMs: track.durationMs });
           }
        }

        usePlayerStore.getState().updateState({ status: 'PLAYING', isPlaying: true, errorMessage: undefined });
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
    this.clearInitTimeout();
    
    // Map YouTube specific errors to friendly Hindi UI messages
    let message = 'Ye gaana abhi nahi mil raha. Agla wala sunte hain.';
    if (errorData === 2) message = 'Invalid track... Agla gaana sunte hain.';
    if (errorData === 101 || errorData === 150) message = 'Ye gaana embed nahi ho sakta. Skipping...';
    
    usePlayerStore.getState().updateState({ 
      status: 'ERROR', 
      isPlaying: false,
      errorMessage: message
    });
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

  private clearInitTimeout() {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
      this.initTimeout = null;
    }
  }
}

export const PlayerManager = new PlayerManagerService();
