import React, { useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubeEvent, YouTubeProps } from 'react-youtube';
import { PlayerManager } from '../../services/PlayerManager';
import { AppConfig } from '../../config';

export const HiddenYouTubePlayer: React.FC = () => {

  const onReady = (event: YouTubeEvent) => {
    PlayerManager.attachPlayer(event.target);
    
    // The YouTube iframe can sometimes steal focus and intercept hardware media keys.
    // By forcing tabindex to -1, we ensure it never receives focus, allowing the OS to handle volume.
    try {
      const iframe = event.target.getIframe();
      if (iframe) {
        iframe.setAttribute('tabindex', '-1');
      }
    } catch (err) {
      console.warn("Could not set tabindex on YouTube iframe", err);
    }
  };

  const onStateChange = (event: YouTubeEvent) => {
    PlayerManager.onStateChange(event.data);
  };

  const onError = (event: YouTubeEvent) => {
    PlayerManager.onError(event.data);
  };

  useEffect(() => {
    // Forcefully remove focus from any iframe to prevent it from intercepting media keys
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'IFRAME') {
        target.blur();
        // Also move focus back to body
        window.focus();
      }
    };
    
    window.addEventListener('focus', handleFocus, true);
    return () => window.removeEventListener('focus', handleFocus, true);
  }, []);

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
      listType: 'playlist',
      list: AppConfig.youtubePlaylistId,
      origin: window.location.origin
    },
  };

  return (
    <div style={{ position: 'fixed', top: -9999, left: -9999, opacity: 0, pointerEvents: 'none' }}>
      <YouTube
        opts={opts}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
      />
    </div>
  );
};
