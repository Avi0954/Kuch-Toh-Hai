import type { SearchResult, Playlist, Track } from '@kuch-toh-hai/shared';
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

    try {
      const response = await fetch(`${API_BASE}/youtube/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        if (response.status === 429) throw new Error('Lagta hai abhi bheed zyada hai... thodi der baad aana.');
        throw new Error('Raasta thoda kharab hai. Internet connection check karein?');
      }
      return await response.json();
    } catch (error: any) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Raasta thoda kharab hai. Internet connection check karein?');
      }
      throw error;
    }
  },

  getPlaylistTracks: async (playlistId: string): Promise<Track[]> => {
    try {
      const response = await fetch(`${API_BASE}/youtube/playlists/${encodeURIComponent(playlistId)}`);
      if (!response.ok) {
        throw new Error('API Error');
      }
      return await response.json();
    } catch (error: any) {
      console.warn("YouTube API failed, falling back to mock data.", error);
      // Fallback to mock data so the user experience doesn't break
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockTracks), 500);
      });
    }
  },

  getFeaturedPlaylists: async (): Promise<Playlist[]> => {
    if (USE_MOCK) {
      return new Promise(resolve => setTimeout(() => resolve(mockPlaylists), 300));
    }
    // Implement real fetch later
    return [];
  }
};
