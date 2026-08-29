import { Router } from 'express';
import { searchMusic, getPlaylist, getRelatedTracks } from '../controllers/youtube.controller';

const router = Router();

router.get('/search', searchMusic);
router.get('/playlists/:id', getPlaylist);
router.get('/videos/:id/related', getRelatedTracks);

export default router;
