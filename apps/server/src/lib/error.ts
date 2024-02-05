import express from 'express';
import { z } from 'zod';
export const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (err instanceof z.ZodError) {
    res.status(400).json({
      message: err.message,
      code: 'invalid_request_error',
      details: err.issues,
    });
  } else {
    res.status(500).json({
      message: err.message,
      code: 'internal_server_error',
    });
  }
};
