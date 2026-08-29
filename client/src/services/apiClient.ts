import { SearchResult, Track, Playlist } from '@kuch-toh-hai/shared';
import { mockTracks, mockPlaylists } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const apiClient = {
  search: async (query: string): Promise<SearchResult> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            tracks: mockTracks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())),
            playlists: mockPlaylists.filter(p => p.title.toLowerCase().includes(query.toLowerCase())),
          });
        }, 500);
      });
    }

    const response = await fetch(`${API_BASE}/youtube/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch search results');
    return response.json();
  },

  getFeaturedPlaylists: async (): Promise<Playlist[]> => {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(mockPlaylists), 300));
    }
    // Implement real fetch later
    return [];
  }
};
