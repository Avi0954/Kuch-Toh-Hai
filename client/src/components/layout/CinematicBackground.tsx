import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import bg1 from '../../assets/bg1.png';
import bg2 from '../../assets/bg2.png';
import bg3 from '../../assets/bg3.png';
import bg4 from '../../assets/bg4.png';
import bg5 from '../../assets/bg5.png';
import bg6 from '../../assets/bg6.png';
import bg7 from '../../assets/bg7.png';
import bg8 from '../../assets/bg8.png';
import './CinematicBackground.css';

const backgrounds = [bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8];

export const CinematicBackground: React.FC = () => {
  const currentTrackId = usePlayerStore(state => state.currentTrack?.id);
  const [bgIndex, setBgIndex] = useState(0);

  // Change background whenever the song changes
  useEffect(() => {
    if (currentTrackId) {
      setBgIndex(prev => (prev + 1) % backgrounds.length);
    }
  }, [currentTrackId]);

  return (
    <div className="cinematic-bg-container">
      {/* Primary Background Image */}
      {backgrounds.map((bg, idx) => (
        <img 
          key={bg}
          src={bg} 
          alt="Background" 
          className={`cinematic-bg-image ${idx === bgIndex ? 'active' : ''}`}
        />
      ))}
    </div>
  );
};
