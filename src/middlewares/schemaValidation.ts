import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const schemaValidation =
  (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const { error } = (schema).validate(body, { abortEarly: false });

    if (error?.isJoi) {
      return res.status(400).json({
        message: 'You have passed wrong parameters',
        errorInfo: error.details.map(({ message, path }) => ({ [path[0]]: message }))
      });
    }

    next();
  };
