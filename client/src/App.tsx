
import { Suspense, lazy, useState, useEffect } from 'react';
import { CinematicBackground } from './components/layout/CinematicBackground';
import { UnifiedPlayerView } from './components/player/UnifiedPlayerView';
import { useGlobalKeybinds } from './hooks/useGlobalKeybinds';
import './App.css';

// Lazy load the iframe since it's invisible anyway
const HiddenYouTubePlayer = lazy(() => import('./components/player/HiddenYouTubePlayer').then(module => ({ default: module.HiddenYouTubePlayer })));

function App() {
  useGlobalKeybinds();
  const [loadPlayer, setLoadPlayer] = useState(false);

  useEffect(() => {
    // Defer YouTube Player initialization slightly to ensure initial background, title, and UI render first
    const timer = setTimeout(() => {
      setLoadPlayer(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <CinematicBackground />
      <UnifiedPlayerView />
      
      {loadPlayer && (
        <Suspense fallback={null}>
          <HiddenYouTubePlayer />
        </Suspense>
      )}
    </>
  );
}

export default App;
