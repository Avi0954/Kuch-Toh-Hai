import React, { useEffect, useState } from 'react';
import { useJourneyStore } from '../../store/useJourneyStore';
import './OpeningSequence.css';

export const OpeningSequence: React.FC = () => {
  const { phase, setPhase } = useJourneyStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (phase === 'opening') {
      // Step 1: Environment gradually appears (black overlay fades out)
      const t1 = setTimeout(() => setStep(1), 500);
      
      // Step 2: Typography enters
      const t2 = setTimeout(() => setStep(2), 2500);
      
      // Step 3: "KUCH TOH HAI" appears
      const t3 = setTimeout(() => setStep(3), 4000);
      
      // Step 4: Supporting visual element appears
      const t4 = setTimeout(() => setStep(4), 5500);
      
      // Step 5: Interface gradually reveals itself (music experience becomes available)
      const t5 = setTimeout(() => setStep(5), 6500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
      };
    }
  }, [phase]);

  const handleEnter = () => {
    if (step >= 5) {
      setStep(6); // Trigger exit animation
      setTimeout(() => {
        setPhase('discovery');
      }, 2000);
    }
  };

  // Only render during the opening sequence
  if (phase !== 'opening') return null;

  return (
    <div className={`opening-choreography ${step >= 6 ? 'exit' : ''}`}>
      
      {/* The solid black overlay that fades out to reveal the CinematicBackground */}
      <div className={`opening-black-overlay ${step >= 1 ? 'fade-out' : ''}`}></div>

      <div className="opening-content">
        
        {/* Step 2: Typography enters */}
        <p className={`opening-subtitle text-caption ${step >= 2 ? 'visible' : ''}`}>
          A Cinematic Music Experience
        </p>

        {/* Step 3: Title appears */}
        <h1 className={`opening-title text-title ${step >= 3 ? 'visible' : ''}`}>
          Kuch Toh Hai
        </h1>

        {/* Step 4: Supporting visual element */}
        <div className={`opening-decorative-line ${step >= 4 ? 'visible' : ''}`}></div>

        {/* Step 5: Interface reveals itself */}
        <button 
          className={`btn-invisible opening-enter-btn text-body ${step >= 5 ? 'visible' : ''}`}
          onClick={handleEnter}
          disabled={step < 5}
        >
          Begin the Journey
        </button>

      </div>
    </div>
  );
};
