import type { Knex } from "knex";
import path from "path";

interface KnexConfig {
  [key: string]: Knex.Config;
}

const config: KnexConfig = {
  development: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    migrations: {
      directory: path.join(__dirname, "../src/db/migrations"),
    },
    seeds: {
      directory: path.join(__dirname, "../src/db/seeds"),
    },
  },
  production: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    migrations: {
      directory: path.join(__dirname, "../src/db/migrations"),
    },
  },
};

export default config;
