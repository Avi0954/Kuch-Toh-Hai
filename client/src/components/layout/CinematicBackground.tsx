import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import './CinematicBackground.css';

const TOTAL_BACKGROUNDS = 9;

const getBgUrls = (index: number, isMobile: boolean) => {
  const bgNum = (index % TOTAL_BACKGROUNDS) + 1;
  const mode = isMobile ? 'mobile' : 'desktop';
  return {
    avif: `/backgrounds/bg${bgNum}-${mode}.avif`,
    webp: `/backgrounds/bg${bgNum}-${mode}.webp`
  };
};

export const CinematicBackground: React.FC = () => {
  const currentTrackId = usePlayerStore(state => state.currentTrack?.id);
  const [bgIndex, setBgIndex] = useState(0);

  // Responsive device check
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial background URL
  const initialUrls = getBgUrls(0, isMobile);
  const [activeBgUrl, setActiveBgUrl] = useState<string>(initialUrls.avif);
  const [nextBgUrl, setNextBgUrl] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadedCacheRef = useRef<Set<string>>(new Set([initialUrls.avif, initialUrls.webp]));

  // Change background whenever the song changes
  useEffect(() => {
    if (currentTrackId) {
      setBgIndex(prev => (prev + 1) % TOTAL_BACKGROUNDS);
    }
  }, [currentTrackId]);

  // Load new background asynchronously when bgIndex or device mode changes
  useEffect(() => {
    const urls = getBgUrls(bgIndex, isMobile);
    const targetUrl = urls.avif;

    if (targetUrl === activeBgUrl) return;

    const loadAndTransition = (urlToUse: string) => {
      setNextBgUrl(urlToUse);
      // Allow DOM to register next image before starting transition
      requestAnimationFrame(() => {
        setIsTransitioning(true);
      });

      const timer = setTimeout(() => {
        setActiveBgUrl(urlToUse);
        setNextBgUrl(null);
        setIsTransitioning(false);
      }, 3000); // Matches CSS transition duration

      return () => clearTimeout(timer);
    };

    if (loadedCacheRef.current.has(targetUrl)) {
      return loadAndTransition(targetUrl);
    } else {
      // Preload image offscreen
      const img = new Image();
      img.src = targetUrl;
      img.onload = () => {
        loadedCacheRef.current.add(targetUrl);
        loadAndTransition(targetUrl);
      };
      img.onerror = () => {
        // Fallback to WebP if AVIF is unsupported or fails
        const fallbackImg = new Image();
        fallbackImg.src = urls.webp;
        fallbackImg.onload = () => {
          loadedCacheRef.current.add(urls.webp);
          loadAndTransition(urls.webp);
        };
      };
    }
  }, [bgIndex, isMobile]);

  return (
    <div className="cinematic-bg-container">
      {/* Active Layer */}
      {activeBgUrl && (
        <img 
          src={activeBgUrl} 
          alt="Background" 
          className={`cinematic-bg-image active`}
        />
      )}

      {/* Next Transitioning Layer */}
      {nextBgUrl && (
        <img 
          src={nextBgUrl} 
          alt="Background" 
          className={`cinematic-bg-image ${isTransitioning ? 'active' : ''}`}
        />
      )}
    </div>
  );
};

