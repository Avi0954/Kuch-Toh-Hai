import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { apiClient } from '../../services/apiClient';
import { Track } from '@kuch-toh-hai/shared';
import './DiscoveryView.css';

export const DiscoveryView: React.FC = () => {
  const { phase, setPhase, setAmbientColor } = useJourneyStore();
  const { play } = usePlayerStore();
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    // Fetch initial tracks (mocked for now)
    const fetchMusic = async () => {
      const results = await apiClient.search(''); // empty search to get all mocks
      setTracks(results.tracks);
    };
    fetchMusic();
  }, []);

  const handlePlayTrack = (track: Track) => {
    play(track);
    setPhase('playing');
  };

  const handleMouseEnter = (track: Track) => {
    // Ideally, we extract color from track.artwork. For now, pseudo-random warm colors
    const colors = ['#1a0f14', '#0f121a', '#1a180f', '#0f1a16'];
    const idx = track.title.length % colors.length;
    setAmbientColor(colors[idx]);
  };

  const handleMouseLeave = () => {
    setAmbientColor('#050505');
  };

  if (phase !== 'discovery' && phase !== 'playing') return null;

  return (
    <div className={`discovery-container ${phase === 'playing' ? 'fade-back' : ''}`}>
      <div className="discovery-header text-caption">Explore</div>
      
      <div className="track-list no-scrollbar">
        {tracks.map((track) => (
          <div 
            key={track.id} 
            className="track-item"
            onClick={() => handlePlayTrack(track)}
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
