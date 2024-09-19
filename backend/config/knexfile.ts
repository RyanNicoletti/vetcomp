import dotenv from "dotenv";
import path from "path";
import type { Knex } from "knex";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    migrations: {
      directory: "../src/db/migrations",
    },
    seeds: {
      directory: "../src/db/seeds",
    },
  },
  production: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    migrations: {
      directory: "../src/db/migrations",
    },
  },
};

export = config;
