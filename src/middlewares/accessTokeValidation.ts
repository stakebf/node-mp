import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const { headers: {
    authorization: token
  } } = req;

  if (typeof token === 'string') {
    return jwt.verify(token.split(' ')[1], process.env.ACCESS_TOKEN ?? '', (err) => {
      if (err) {
        return res.sendStatus(403);
      }

      return next();
    });
  }

  return res.sendStatus(401);
};

export default validateToken;
