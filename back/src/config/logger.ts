import winston from "winston";

const levels = winston.config.npm.levels;

const level = process.env.NODE_ENV === "production" ? "warn" : "debug";

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(colors);

const baseFormat = [
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
];

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  ...baseFormat,
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.stack || info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.uncolorize(),
  ...baseFormat,
  winston.format.json()
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: level,
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true,
  }),
];

if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
  const SIZE_5MB = 5 * 1024 * 1024;
  const SIZE_10MB = 10 * 1024 * 1024;
  transports.push(
    new winston.transports.File({
      level: "warn",
      filename: "logs/app-warn.log",
      format: fileFormat,
      maxsize: SIZE_5MB,
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true,
    })
  );
  transports.push(
    new winston.transports.File({
      level: "info",
      filename: "logs/app-combined.log",
      format: fileFormat,
      maxsize: SIZE_10MB,
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: level,
  levels: levels,
  format: winston.format.json(),
  transports: transports,
  exitOnError: false,
});

export default logger;
