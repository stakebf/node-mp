import { Request, Response, NextFunction } from 'express';
import logger from '@src/logger';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Server error');
  return res.status(500).json({ message: 'Server error', info: err?.message ?? err });
};

export default errorHandler;
