import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import getUserSchema from '@shared/schemes/user';

export const userValidationMiddleware =
  (method: string) => (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { error } = (getUserSchema(method) as Schema).validate(body, { abortEarly: false });

    if (error?.isJoi) {
      return res.status(400).json({
        message: 'You have passed wrong parameters',
        errorInfo: error.details.map(({ message, path }) => ({ [path[0]]: message }))
      });
    }

    next();
  };
