import knex from "knex";
import configuration, { Environment } from "./knexfile";

const environment = (process.env.NODE_ENV || "development") as Environment;
const connectionConfig = configuration[environment];

if (!connectionConfig) {
  throw new Error(
    `Knex configuration for environment "${environment}" not found.`
  );
}

const connection = knex(connectionConfig);

export default connection;
