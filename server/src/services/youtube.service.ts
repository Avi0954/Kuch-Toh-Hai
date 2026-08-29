import axios from 'axios';
import NodeCache from 'node-cache';
import { Track } from '@kuch-toh-hai/shared';
import { mapYouTubeVideoToTrack } from '../utils/youtubeMapper';
import { InvalidRequestError, QuotaExceededError, VideoUnavailableError } from '../utils/errors';

// Cache configuration: stdTTL = 24 hours to aggressively save quota during development/usage
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 1200 });

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

export class YouTubeService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    if (!this.apiKey || this.apiKey === 'your_youtube_api_key_here') {
      console.warn('WARNING: YOUTUBE_API_KEY is not set or is using the default placeholder.');
    }
  }

  private async get(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(`${YOUTUBE_API_URL}/${endpoint}`, {
        params: {
          ...params,
          key: this.apiKey,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || 'YouTube API Error';
        
        if (status === 403 && message.toLowerCase().includes('quota')) {
          throw new QuotaExceededError();
        }
        if (status === 400) {
          throw new InvalidRequestError(message);
        }
        if (status === 404) {
          throw new VideoUnavailableError();
        }
      }
      throw error;
    }
  }

  /**
   * Search for Hindi/Bollywood romantic music.
   */
  async search(query: string, maxResults: number = 10): Promise<Track[]> {
    const cacheKey = `search:${query}:${maxResults}`;
    const cached = cache.get<Track[]>(cacheKey);
    if (cached) return cached;

    // 1. Search for videos
    const searchData = await this.get('search', {
      q: query,
      part: 'snippet',
      type: 'video',
      videoCategoryId: '10', // Music
      maxResults,
    });

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

    // 2. Fetch video details for accurate duration
    const tracks = await this.getVideosDetails(videoIds);

    cache.set(cacheKey, tracks);
    return tracks;
  }

  /**
   * Fetch specific video details given a comma-separated list of IDs.
   */
  async getVideosDetails(videoIds: string): Promise<Track[]> {
    const cacheKey = `videos:${videoIds}`;
    const cached = cache.get<Track[]>(cacheKey);
    if (cached) return cached;

    const data = await this.get('videos', {
      id: videoIds,
      part: 'snippet,contentDetails',
    });

    if (!data.items) return [];

    const tracks = data.items.map(mapYouTubeVideoToTrack);
    cache.set(cacheKey, tracks);
    return tracks;
  }

  /**
   * Retrieve tracks from a curated playlist.
   */
  async getPlaylist(playlistId: string, maxResults: number = 20): Promise<Track[]> {
    const cacheKey = `playlist:${playlistId}:${maxResults}`;
    const cached = cache.get<Track[]>(cacheKey);
    if (cached) return cached;

    const data = await this.get('playlistItems', {
      playlistId,
      part: 'snippet',
      maxResults,
    });

    if (!data.items || data.items.length === 0) return [];

    // Extract video IDs from playlist items
    const videoIds = data.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .filter(Boolean)
      .join(',');

    // Fetch details to get duration
    const tracks = await this.getVideosDetails(videoIds);
    
    cache.set(cacheKey, tracks);
    return tracks;
  }

  /**
   * Get related tracks based on a video ID.
   */
  async getRelatedTracks(videoId: string, maxResults: number = 10): Promise<Track[]> {
    const cacheKey = `related:${videoId}:${maxResults}`;
    const cached = cache.get<Track[]>(cacheKey);
    if (cached) return cached;

    const data = await this.get('search', {
      relatedToVideoId: videoId,
      part: 'snippet',
      type: 'video',
      maxResults,
    });

    if (!data.items || data.items.length === 0) return [];

    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const tracks = await this.getVideosDetails(videoIds);

    cache.set(cacheKey, tracks);
    return tracks;
  }
}
