import type { Knex } from "knex";

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
      directory: "../src/db/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "../src/db/seeds",
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
      directory: "../src/db/migrations",
      extension: "ts",
    },
  },
};

export default config;
