import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerManager } from '../../services/PlayerManager';
import { usePlayerStore } from '../../store/usePlayerStore';
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
  
  // Player State
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const volume = usePlayerStore(state => state.volume);
  const isMuted = usePlayerStore(state => state.isMuted);
  const progressMs = usePlayerStore(state => state.progressMs);
  const durationMs = currentTrack?.durationMs || 0;
  const progressPercent = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Actions
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
    // Calculate relative offset for now if seek behavior is relative. Wait, the underlying API can seek directly. 
    PlayerManager.seek(targetMs);
  };

  const artworkUrl = currentTrack?.artwork?.find(a => a.url.includes('maxresdefault'))?.url 
    || currentTrack?.artwork?.find(a => a.url.includes('hqdefault'))?.url 
    || currentTrack?.artwork?.[0]?.url;

  return (
    <main className="unified-container animate-fade-in">
      <header className="unified-header">
        <h1 className="unified-logo">Kuch Toh Hai.</h1>
      </header>

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
