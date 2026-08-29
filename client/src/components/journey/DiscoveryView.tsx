import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import { PlayerManager } from '../../services/PlayerManager';
import { apiClient } from '../../services/apiClient';
import { Track } from '@kuch-toh-hai/shared';
import './DiscoveryView.css';

export const DiscoveryView: React.FC = () => {
  const { phase, setPhase, setAmbientColor } = useJourneyStore();
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    // Fetch initial tracks (mocked for now)
    const fetchMusic = async () => {
      const results = await apiClient.search(''); // empty search to get all mocks
      setTracks(results.tracks);
    };
    fetchMusic();
  }, []);

  const handlePlayTrack = (track: Track, index: number) => {
    PlayerManager.loadQueue(tracks, index);
    setPhase('playing');
  };

  const handleMouseEnter = (track: Track) => {
    // Ideally, we extract color from track.artwork. For now, pseudo-random warm colors
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
      <div className="discovery-header text-caption">Explore</div>
      
      <div className="track-list no-scrollbar">
        {tracks.map((track, index) => (
          <div 
            key={track.id} 
            className="track-item"
            onClick={() => handlePlayTrack(track, index)}
            onMouseEnter={() => handleMouseEnter(track)}
            onMouseLeave={handleMouseLeave}
          >
            <span className="track-title text-heading">{track.title}</span>
            <span className="track-artist text-body">{track.artist.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
