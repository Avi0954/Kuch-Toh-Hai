import React from 'react';
import { Play, Pause, ChevronLeft } from 'lucide-react';
import { useJourneyStore } from '../../store/useJourneyStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import './ActivePlayer.css';

export const ActivePlayer: React.FC = () => {
  const { phase, setPhase } = useJourneyStore();
  const { currentTrack, isPlaying, pause, resume, progressMs } = usePlayerStore();

  if (phase !== 'playing' || !currentTrack) return null;

  const handleBack = () => {
    setPhase('discovery');
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  // Minimal Progress Bar at bottom
  const progressPercent = currentTrack.durationMs > 0 
    ? (progressMs / currentTrack.durationMs) * 100 
    : 0;

  return (
    <div className="active-player-container animate-fade-in">
      
      {/* Top Navigation */}
      <div className="player-top-nav">
        <button className="btn-invisible nav-back text-caption" onClick={handleBack}>
          <ChevronLeft size={16} />
          Back to Explore
        </button>
      </div>

      {/* Main Focus */}
      <div className="player-center-stage">
        <div className="player-artwork">
          <img src={currentTrack.artwork[0]?.url} alt={currentTrack.title} />
        </div>
        <div className="player-meta">
          <h2 className="text-title">{currentTrack.title}</h2>
          <p className="text-body">{currentTrack.artist.name}</p>
        </div>
        
        <div className="player-controls">
          <button className="btn-invisible control-btn" onClick={togglePlay}>
            {isPlaying ? <Pause size={42} strokeWidth={1} /> : <Play size={42} strokeWidth={1} />}
          </button>
        </div>
      </div>

      {/* Minimal Progress Bar at bottom */}
      <div className="player-progress-container">
        <div className="player-progress-bar" style={{ width: `${progressPercent}%` }}></div>
      </div>

    </div>
  );
};
