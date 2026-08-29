export class APIError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class QuotaExceededError extends APIError {
  constructor(message: string = 'YouTube API quota exceeded.') {
    super(message, 429);
  }
}

export class VideoUnavailableError extends APIError {
  constructor(message: string = 'The requested video is unavailable or private.') {
    super(message, 404);
  }
}

export class InvalidRequestError extends APIError {
  constructor(message: string = 'Invalid request to YouTube API.') {
    super(message, 400);
  }
}
