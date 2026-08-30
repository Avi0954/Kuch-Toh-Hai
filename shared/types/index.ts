export type Artist = {
  id: string;
  name: string;
  channelId?: string; // If sourced from YouTube
};

export type AlbumArtwork = {
  url: string;
  width: number;
  height: number;
  colorPalette?: string[]; // Extracted colors for cinematic UI
};

export type Track = {
  id: string; // YouTube Video ID
  title: string;
  artist: Artist;
  artwork: AlbumArtwork[];
  durationMs: number;
  mood?: string;
};

export type Playlist = {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
  coverArt: AlbumArtwork;
};

export type PlayerState = {
  queue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  status: 'IDLE' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'BUFFERING' | 'ERROR';
  errorMessage?: string;
  playerReady: boolean;
};

export type YouTubeVideo = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
    channelTitle: string;
  };
  contentDetails?: {
    duration: string; // ISO 8601 duration
  };
};

export type YouTubePlaylist = {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: Record<string, { url: string; width: number; height: number }>;
  };
};

export type SearchResult = {
  tracks: Track[];
  playlists: Playlist[];
  nextPageToken?: string;
};

export type ApplicationState = {
  mood: 'romantic' | 'nostalgic' | 'upbeat' | 'neutral';
  isMenuOpen: boolean;
  activeView: 'home' | 'player' | 'explore';
};
