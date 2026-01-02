import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  // Skip rate limiting during local development to avoid accidental 429s
  skip: (req) => process.env.NODE_ENV === 'development' || req.ip === '::1' || req.ip === '127.0.0.1',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  // Allow more generous auth attempts in development
  skip: () => process.env.NODE_ENV === 'development',
  skipSuccessfulRequests: true,
});
