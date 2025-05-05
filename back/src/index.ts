import express, { Express, json } from "express";
import cors from "cors";
import { reportsRouter } from "@/features/reports/router";
import { errorHandler } from "@/shared/middleware/errror-handler";
import { ApiError } from "@/shared/errors/api-error";
import logger from "@/config/logger";
import { companiesRouter } from "./features/companies/router";

export function createApp(): Express {
  const app = express();
  app.use(cors({ credentials: true }));
  app.use(json());

  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // features routes
  app.use("/api/reports", reportsRouter);
  app.use("/api/companies", companiesRouter);

  // health check
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req, _res, next) => {
    next(
      new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, 404)
    );
  });

  //generic error handler
  app.use(errorHandler);

  return app;
}
