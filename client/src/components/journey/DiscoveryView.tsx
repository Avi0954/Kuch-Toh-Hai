import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import { PlayerManager } from '../../services/PlayerManager';
import { usePlayerStore } from '../../store/usePlayerStore';
import { apiClient } from '../../services/apiClient';
import type { Track } from '@kuch-toh-hai/shared';
import './DiscoveryView.css';

export const DiscoveryView: React.FC = () => {
  const { phase, setPhase, setAmbientColor } = useJourneyStore();
  const { currentTrack, isPlaying } = usePlayerStore();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMusic = async () => {
      try {
        setIsLoading(true);
        const results = await apiClient.search(''); // empty search defaults to 'Bollywood romantic' on backend
        if (isMounted) setTracks(results.tracks);
      } catch (error) {
        console.error("Failed to load tracks", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchMusic();
    return () => { isMounted = false; };
  }, []);

  const handlePlayTrack = (_track: Track, index: number) => {
    PlayerManager.loadQueue(tracks, index);
    setPhase('playing');
  };

  const handleKeyDown = (e: React.KeyboardEvent, track: Track, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlayTrack(track, index);
    }
  };

  const handleMouseEnter = (track: Track) => {
    // Ideally, extract color from artwork. For now, pseudo-random warm colors
    const colors = ['#1a0f14', '#0f121a', '#1a180f', '#0f1a16'];
    const idx = track.title.length % colors.length;
    setAmbientColor(colors[idx]);
  };

  const handleMouseLeave = () => {
    setAmbientColor('#1a1311');
  };

  if (phase !== 'discovery' && phase !== 'playing') return null;

  return (
    <div className={`discovery-container ${phase === 'playing' ? 'fade-back' : ''}`}>
      <div className="discovery-header text-caption">Explore the Journey</div>
      
      <div className="track-list no-scrollbar">
        {isLoading ? (
          // Skeleton Loading State
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="track-row skeleton-row">
              <div className="skeleton-artwork"></div>
              <div className="skeleton-meta">
                <div className="skeleton-title"></div>
                <div className="skeleton-artist"></div>
              </div>
            </div>
          ))
        ) : tracks.length === 0 ? (
          // Empty State
          <div className="empty-state text-body">The night is quiet... No music found.</div>
        ) : (
          // Loaded Tracks
          tracks.map((track, index) => {
            const isActive = currentTrack?.id === track.id;
            
            return (
              <div 
                key={track.id} 
                className={`track-row ${isActive ? 'active' : ''}`}
                onClick={() => handlePlayTrack(track, index)}
                onMouseEnter={() => handleMouseEnter(track)}
                onMouseLeave={handleMouseLeave}
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, track, index)}
                aria-label={`Play ${track.title} by ${track.artist.name}`}
              >
                <div className="track-artwork-container">
                  <img src={track.artwork[0]?.url} alt={track.title} className="track-artwork" loading="lazy" />
                  {isActive && isPlaying && (
                    <div className="track-equalizer">
                      <span></span><span></span><span></span>
                    </div>
                  )}
                </div>
                
                <div className="track-meta">
                  <span className="track-title text-heading">{track.title}</span>
                  <span className="track-artist text-body">{track.artist.name}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
