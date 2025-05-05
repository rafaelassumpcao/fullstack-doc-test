import path from "path";

export type Environment = "development" | "production" | "test";

const config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: path.join(__dirname, "migrations"),
    extension: "ts",
  },
  seeds: {
    directory: path.join(__dirname, "seeds"),
    extension: "ts",
  },
  useNullAsDefault: true,
  debug: process.env.NODE_ENV === "development",
};
if (process.env.NODE_ENV === "test") {
  config.connection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

export default {
  development: config,
  production: config,
  test: config,
} as { [key in Environment]: typeof config };
