import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export function RequestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.headers['x-request-id'] ?? randomUUID();
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('x-request-id', requestId as string);
  next();
}
