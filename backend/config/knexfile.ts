import type { Knex } from "knex";
import path from "path";

if (!process.env.DB_CONNECTION_URL) {
  console.error(
    "Database connection URL is not defined in environment variables"
  );
  process.exit(1);
}

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.resolve(__dirname, "../src/db/migrations"),
      extension: "ts",
    },
    seeds: {
      directory: path.resolve(__dirname, "../src/db/seeds"),
      extension: "ts",
    },
  },
  production: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.resolve(__dirname, "../src/db/migrations"),
      extension: "ts",
    },
  },
};

export default config;
