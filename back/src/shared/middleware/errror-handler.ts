import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/shared/errors/api-error";
import logger from "@/config/logger";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error("Error Caught by Middleware:", err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(typeof err.details === "object" && err.details !== null
        ? { details: err.details }
        : {}),
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && {
        error: err.message,
        stack: err.stack,
      }),
    });
  }
}
