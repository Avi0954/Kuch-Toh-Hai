import React from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import './CinematicBackground.css';

export const CinematicBackground: React.FC = () => {
  const { ambientColor, phase } = useJourneyStore();

  const isDimmed = phase === 'opening' || phase === 'title_reveal';

  return (
    <div 
      className="cinematic-bg-container"
      style={{
        backgroundColor: isDimmed ? '#000000' : ambientColor,
        opacity: isDimmed ? 0 : 1
      }}
    >
      <div className="noise-overlay"></div>
      <div className="gradient-overlay"></div>
    </div>
  );
};
