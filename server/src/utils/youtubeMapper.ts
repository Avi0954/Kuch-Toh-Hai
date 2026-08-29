import { Track, Artist, AlbumArtwork } from '@kuch-toh-hai/shared';

/**
 * Parses an ISO 8601 duration string (e.g., PT4M13S) into milliseconds.
 */
export const parseISODuration = (duration: string): number => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);
  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
};

/**
 * Maps a raw YouTube video item to our internal Track representation.
 * Prevents raw YouTube data structures from leaking into the frontend.
 */
export const mapYouTubeVideoToTrack = (item: any): Track => {
  const snippet = item.snippet || {};
  const contentDetails = item.contentDetails || {};

  const artist: Artist = {
    id: snippet.channelId || 'unknown',
    name: snippet.channelTitle || 'Unknown Artist',
    channelId: snippet.channelId,
  };

  // Convert thumbnails to AlbumArtwork array
  const artwork: AlbumArtwork[] = [];
  if (snippet.thumbnails) {
    const thumbs = snippet.thumbnails;
    // Prefer highres, then standard, then high, then medium, then default
    ['maxres', 'standard', 'high', 'medium', 'default'].forEach((key) => {
      if (thumbs[key]) {
        artwork.push({
          url: thumbs[key].url,
          width: thumbs[key].width,
          height: thumbs[key].height,
        });
      }
    });
  }

  // Fallback to a placeholder if absolutely no thumbnail
  if (artwork.length === 0) {
    artwork.push({
      url: 'https://via.placeholder.com/300',
      width: 300,
      height: 300,
    });
  }

  const durationMs = contentDetails.duration 
    ? parseISODuration(contentDetails.duration)
    : 0; // Will be 0 for search results if details not fetched

  return {
    id: item.id?.videoId || item.id, // Handles both search results and video endpoints
    title: snippet.title ? decodeHTMLEntities(snippet.title) : 'Unknown Title',
    artist,
    artwork,
    durationMs,
    mood: 'neutral', // default, could be determined later by analyzing title/tags
  };
};

/**
 * Simple utility to decode HTML entities like &quot; and &#39; returned by YouTube API
 */
const decodeHTMLEntities = (text: string) => {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};
