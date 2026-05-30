import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/httpErrors";
import z from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
      },
    });
  } else if (err instanceof z.ZodError) {
    res.status(400).json({
      error: {
        message: "Validation error",
        details: err.issues,
        status: 400,
      },
    });
  } else {
    res.status(500).json({
      error: {
        message: "An unexpected error occurred",
        status: 500,
      },
    });
  }
};
