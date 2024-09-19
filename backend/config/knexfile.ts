import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface KnexConfig {
  [key: string]: {
    client: string;
    connection: string | undefined;
    migrations: {
      directory: string;
    };
    seeds?: {
      directory: string;
    };
  };
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

module.exports = config;
