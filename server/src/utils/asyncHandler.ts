import { NextFunction, Request, Response } from 'express'

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => void) => (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err))
}

export default asyncHandler