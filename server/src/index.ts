import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PlayerState } from '@kuch-toh-hai/shared'; // just testing the import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import youtubeRoutes from './routes/youtube.routes';
import { errorHandler } from './middleware/errorHandler';

// ... (config and express setup)

app.use('/api/youtube', youtubeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware should be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
