import type { Track, Playlist } from '@kuch-toh-hai/shared';

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Tum Hi Ho',
    artist: { id: 'a1', name: 'Arijit Singh' },
    artwork: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }],
    durationMs: 262000,
    mood: 'romantic',
  },
  {
    id: '2',
    title: 'Pee Loon',
    artist: { id: 'a2', name: 'Mohit Chauhan' },
    artwork: [{ url: 'https://via.placeholder.com/300', width: 300, height: 300 }],
    durationMs: 288000,
    mood: 'romantic',
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: 'p1',
    title: 'First Feelings',
    description: 'When the butterflies first flutter.',
    tracks: mockTracks,
    coverArt: { url: 'https://via.placeholder.com/500', width: 500, height: 500 },
  },
];
