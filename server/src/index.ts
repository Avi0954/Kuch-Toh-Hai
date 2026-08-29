import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PlayerState } from '@kuch-toh-hai/shared'; // just testing the import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Mock route for youtube API
app.get('/api/youtube/search', (req, res) => {
  res.json({ message: 'Mock search route' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
