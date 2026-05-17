import httpStatus from 'http-status';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils';

type TRateLimitOptions = {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
};

type TBucket = { count: number; resetAt: number };

const buckets = new Map<string, TBucket>();

export const rateLimit = (options: TRateLimitOptions) => {
  const { windowMs, max, keyGenerator } = options;

  return (req: Request, _res: Response, next: NextFunction) => {
    const baseKey = keyGenerator ? keyGenerator(req) : req.ip;
    const key = `${baseKey}:${req.originalUrl}`;

    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    existing.count += 1;
    buckets.set(key, existing);

    if (existing.count > max) {
      throw new AppError(httpStatus.TOO_MANY_REQUESTS, 'Too many requests!');
    }

    next();
  };
};
