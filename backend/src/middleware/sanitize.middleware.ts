import { Request, Response, NextFunction } from 'express';
import { sanitizeData } from '../shared/sanitize.js';

/**
 * Express middleware to automatically clean request body, query params, and route params
 * of XSS injection vectors and unsafe HTML scripts.
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeData(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);
  }

  next();
}
