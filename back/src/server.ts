import { createApp } from "./index";
import logger from "@/config/logger";

const PORT = process.env.PORT || 3000;

const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on http://localhost:${PORT}`);
  logger.info(`🌱 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `🔗 Reports comparison endpoint available at /api/reports/compare/:cik`
  );
  logger.info(
    `🔗 Reports Proxy endpoint available at /api/reports/reports-sec?url=<URL_SEC>`
  );
  logger.info(`🔗 Companies endpoint available at /api/companies`);
  logger.info(`❤️ Health check available at /health`);
});

const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];

signals.forEach((signal) => {
  process.on(signal, () => {
    logger.info(`\n👋 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info("✅ HTTP server closed.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error(
        "❌ Could not close connections in time, forcefully shutting down."
      );
      process.exit(1);
    }, 10000);
  });
});
