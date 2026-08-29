import { Request, Response, NextFunction } from 'express';
import { YouTubeService } from '../services/youtube.service';

const youtubeService = new YouTubeService();

export const searchMusic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string || 'Bollywood romantic';
    const tracks = await youtubeService.search(query);
    res.json({ tracks, playlists: [] });
  } catch (error) {
    next(error);
  }
};

export const getPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playlistId = req.params.id;
    if (!playlistId) {
      return res.status(400).json({ error: true, message: 'Playlist ID is required.' });
    }
    const tracks = await youtubeService.getPlaylist(playlistId);
    res.json({ tracks });
  } catch (error) {
    next(error);
  }
};

export const getRelatedTracks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videoId = req.params.id;
    if (!videoId) {
      return res.status(400).json({ error: true, message: 'Video ID is required.' });
    }
    const tracks = await youtubeService.getRelatedTracks(videoId);
    res.json({ tracks });
  } catch (error) {
    next(error);
  }
};
