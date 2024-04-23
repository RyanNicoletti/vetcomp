module.exports = {
  development: {
    client: "pg",
    connection: process.env.DB_CONNECTION_URL,
    migrations: {
      directory: "./src/db/migrations",
    },
  },
};
