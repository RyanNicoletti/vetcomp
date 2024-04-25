import "dotenv/config";

interface KnexConfig {
  [key: string]: {
    client: string;
    connection: string | undefined;
    migrations: {
      directory: string;
    };
  };
}

const config: KnexConfig = {
  development: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
    migrations: {
      directory: "./src/db/migrations",
    },
  },
};

export default config;
