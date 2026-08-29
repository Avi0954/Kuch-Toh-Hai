import React from 'react';
import { CinematicBackground } from './components/layout/CinematicBackground';
import { OpeningSequence } from './components/journey/OpeningSequence';
import { DiscoveryView } from './components/journey/DiscoveryView';
import { ActivePlayer } from './components/player/ActivePlayer';
import './App.css';

function App() {
  return (
    <>
      <CinematicBackground />
      <OpeningSequence />
      <DiscoveryView />
      <ActivePlayer />
    </>
  );
}

export default App;
