import React, { useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { usePlayerStore } from '../../store/usePlayerStore';

export const HiddenYouTubePlayer: React.FC = () => {
  const { currentTrack, isPlaying, volume, setProgress, setStatus, pause } = usePlayerStore();
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<number | null>(null);

  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.playVideo();
        startProgressTracking();
      } else {
        playerRef.current.pauseVideo();
        stopProgressTracking();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const startProgressTracking = () => {
    stopProgressTracking();
    progressInterval.current = window.setInterval(() => {
      if (playerRef.current) {
        const timeSeconds = playerRef.current.getCurrentTime();
        if (timeSeconds) {
          setProgress(timeSeconds * 1000);
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    if (isPlaying) {
      playerRef.current.playVideo();
    }
  };

  const onStateChange = (event: YouTubeEvent) => {
    // 0 = ended, 1 = playing, 2 = paused, 3 = buffering
    switch (event.data) {
      case 0:
        setStatus('IDLE');
        pause();
        stopProgressTracking();
        setProgress(0);
        break;
      case 1:
        setStatus('PLAYING');
        startProgressTracking();
        break;
      case 2:
        setStatus('PAUSED');
        stopProgressTracking();
        break;
      case 3:
        setStatus('BUFFERING');
        break;
      default:
        break;
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  };

  if (!currentTrack) return null;

  return (
    <div style={{ position: 'fixed', top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }}>
      <YouTube
        videoId={currentTrack.id}
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={() => setStatus('ERROR')}
      />
    </div>
  );
};
