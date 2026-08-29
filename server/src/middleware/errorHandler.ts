import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/errors';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err.message);

  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
    });
  }

  // Handle Axios/YouTube specific errors gracefully
  if ((err as any).isAxiosError) {
    const axiosError = err as any;
    const status = axiosError.response?.status || 500;
    const ytMessage = axiosError.response?.data?.error?.message || 'External API Error';
    
    if (status === 403 && ytMessage.toLowerCase().includes('quota')) {
      return res.status(429).json({ error: true, message: 'YouTube API quota exceeded.' });
    }

    return res.status(status).json({
      error: true,
      message: ytMessage,
    });
  }

  res.status(500).json({
    error: true,
    message: 'An unexpected internal server error occurred.',
  });
};
