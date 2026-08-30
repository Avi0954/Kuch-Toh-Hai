import React, { useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, ListMusic, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerManager } from '../../services/PlayerManager';
import { usePlayerStore } from '../../store/usePlayerStore';
import { apiClient } from '../../services/apiClient';
import { AppConfig } from '../../config';
import type { Track } from '@kuch-toh-hai/shared';
import './UnifiedPlayerView.css';

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const formatTime = (ms: number) => {
  if (!ms || isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// -----------------------------------------------------------------------------
// MAIN UNIFIED VIEW
// -----------------------------------------------------------------------------
export const UnifiedPlayerView: React.FC = () => {
  
  // Playlist State
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);

  // Player State
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const currentTrackId = currentTrack?.id;
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const volume = usePlayerStore(state => state.volume);
  const isMuted = usePlayerStore(state => state.isMuted);
  const progressMs = usePlayerStore(state => state.progressMs);
  const durationMs = currentTrack?.durationMs || 0;
  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMusic = async () => {
      try {
        setIsLoading(true);
        const results = await apiClient.getPlaylistTracks(AppConfig.youtubePlaylistId);
        if (isMounted) {
          setTracks(results);
          if (results.length > 0 && !currentTrack) {
             PlayerManager.loadQueue(results, 0);
             setTimeout(() => PlayerManager.pause(), 500); 
          }
        }
      } catch (error: any) {
        console.error("Failed to load tracks", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMusic();
    return () => { isMounted = false; };
  }, [currentTrack]); 

  // Actions
  const handlePlayTrack = useCallback((_track: Track, index: number) => {
    PlayerManager.loadQueue(tracks, index);
  }, [tracks]);

  const togglePlay = () => PlayerManager.togglePlay();
  const handleNext = () => PlayerManager.next();
  const handlePrev = () => PlayerManager.previous();
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    PlayerManager.setVolume(Number(e.target.value));
  };
  const toggleMute = () => PlayerManager.toggleMute();

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!durationMs) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const targetMs = percentage * durationMs;
    // Note: Assuming PlayerManager.seek takes relative seconds, or we need to add absolute seek
    // Wait, PlayerManager.seek takes relative offset. Let's do absolute seek.
    const targetSeconds = targetMs / 1000;
    // Our HiddenYouTubePlayer needs a way to seek absolute.
    // For now, we calculate offset:
    const offsetSec = targetSeconds - (progressMs / 1000);
    PlayerManager.seek(offsetSec);
  };

  const artworkUrl = currentTrack?.artwork.find(a => a.url.includes('maxresdefault'))?.url 
    || currentTrack?.artwork.find(a => a.url.includes('hqdefault'))?.url 
    || currentTrack?.artwork[0]?.url;

  return (
    <main className="unified-container animate-fade-in">
      <header className="unified-header">
        <h1 className="unified-logo">Kuch Toh Hai.</h1>
      </header>

      {/* FLOATING PLAYLIST DRAWER */}
      {showPlaylist && (
        <div className="playlist-drawer">
          <div className="playlist-drawer-header">
            <h3>Up Next</h3>
            <button className="btn-invisible close-btn" onClick={() => setShowPlaylist(false)}>
              <X size={20} />
            </button>
          </div>
          <ul className="drawer-track-list no-scrollbar" role="list">
            {isLoading ? (
               <li className="drawer-empty">Loading...</li>
            ) : tracks.length === 0 ? (
               <li className="drawer-empty">No tracks found.</li>
            ) : (
              tracks.map((track, index) => (
                <li 
                  key={track.id} 
                  className={`drawer-track-row ${currentTrackId === track.id ? 'active' : ''}`}
                  onClick={() => handlePlayTrack(track, index)}
                >
                  <div className="drawer-track-meta">
                    <span className="drawer-track-title">{track.title}</span>
                    <span className="drawer-track-artist">{track.artist.name}</span>
                  </div>
                  {currentTrackId === track.id && isPlaying && (
                    <div className="mini-equalizer"><span></span><span></span><span></span></div>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* PILL PLAYER */}
      <div className="pill-wrapper">
        <div className="pill-player">
          {/* 1. Circular Artwork */}
          <div className="pill-artwork-container">
            {currentTrack ? (
               <img src={artworkUrl} alt={currentTrack.title} className="pill-artwork" />
            ) : (
               <div className="pill-artwork empty"></div>
            )}
          </div>

          {/* 2. Center Info & Progress */}
          <div className="pill-center-content">
            <div className="pill-meta">
              <div className="pill-meta-header">
                <h2 className="pill-title">{currentTrack?.title || 'Connecting...'}</h2>
                
                {/* Utilities mapped to the right side of the meta header */}
                <div className="pill-utilities">
                  <div 
                    className="pill-volume-wrapper"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <div className={`pill-volume-slider-container ${showVolumeSlider ? 'visible' : ''}`}>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange}
                        className="pill-volume-slider"
                      />
                    </div>
                    <button className="btn-invisible pill-utility-btn" onClick={toggleMute}>
                      {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  </div>
                  <button className="btn-invisible pill-utility-btn" onClick={() => setShowPlaylist(!showPlaylist)}>
                    <ListMusic size={16} />
                  </button>
                </div>
              </div>
              <p className="pill-artist">{currentTrack?.artist.name}</p>
            </div>
            
            <div className="pill-progress-row">
              <span className="pill-time">{formatTime(progressMs)}</span>
              <div className="pill-progress-bar-bg" onClick={handleSeek}>
                <div className="pill-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="pill-time">{formatTime(durationMs)}</span>
            </div>
          </div>

          {/* 3. Right Controls */}
          <div className="pill-controls">
            <button className="btn-invisible pill-control-btn" onClick={handlePrev}>
              <ChevronLeft size={20} />
            </button>
            <button className="btn-invisible pill-control-btn play-btn" onClick={togglePlay}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button className="btn-invisible pill-control-btn" onClick={handleNext}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
