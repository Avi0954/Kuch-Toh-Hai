import React, { useEffect } from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import './OpeningSequence.css';

export const OpeningSequence: React.FC = () => {
  const { phase, setPhase } = useJourneyStore();

  useEffect(() => {
    if (phase === 'opening') {
      const timer = setTimeout(() => {
        setPhase('title_reveal');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, setPhase]);

  const handleEnter = () => {
    if (phase === 'title_reveal') {
      setPhase('atmospheric_transition');
      setTimeout(() => {
        setPhase('discovery');
      }, 2000);
    }
  };

  if (phase !== 'opening' && phase !== 'title_reveal' && phase !== 'atmospheric_transition') {
    return null;
  }

  return (
    <div className={`opening-container ${phase === 'atmospheric_transition' ? 'fade-out' : ''}`}>
      <div className={`title-container ${phase === 'title_reveal' ? 'visible' : ''}`}>
        <h1 className="text-title">Kuch Toh Hai</h1>
        <button 
          className="btn-invisible enter-button text-caption animate-fade-up" 
          style={{ animationDelay: '1s', opacity: 0 }}
          onClick={handleEnter}
        >
          Begin the Journey
        </button>
      </div>
    </div>
  );
};
