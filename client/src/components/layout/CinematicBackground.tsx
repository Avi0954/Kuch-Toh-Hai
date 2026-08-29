import React from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import { FilmGrain } from '../visual/FilmGrain';
import { Vignette } from '../visual/Vignette';
import { BokehLights } from '../visual/BokehLights';
import { DustParticles } from '../visual/DustParticles';
import './CinematicBackground.css';

export const CinematicBackground: React.FC = () => {
  const { ambientColor } = useJourneyStore();

  return (
    <>
      {/* Base Layer */}
      <div 
        className="cinematic-bg-container"
        style={{
          backgroundColor: ambientColor,
          opacity: 1
        }}
      >
        <div className="gradient-overlay"></div>
      </div>

      {/* Atmospheric FX Layers */}
      <BokehLights />
      <DustParticles />

      {/* Persistent Lens FX Layers */}
      <Vignette />
      <FilmGrain />
    </>
  );
};
