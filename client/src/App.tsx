
import { Suspense, lazy } from 'react';
import { CinematicBackground } from './components/layout/CinematicBackground';
import { UnifiedPlayerView } from './components/player/UnifiedPlayerView';
import { useGlobalKeybinds } from './hooks/useGlobalKeybinds';
import './App.css';

// Lazy load the iframe since it's invisible anyway
const HiddenYouTubePlayer = lazy(() => import('./components/player/HiddenYouTubePlayer').then(module => ({ default: module.HiddenYouTubePlayer })));

function App() {
  useGlobalKeybinds();
  
  return (
    <>
      <CinematicBackground />
      <UnifiedPlayerView />
      
      <Suspense fallback={null}>
        <HiddenYouTubePlayer />
      </Suspense>
    </>
  );
}

export default App;
