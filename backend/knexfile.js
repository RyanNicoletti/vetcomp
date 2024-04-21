module.exports = {
  development: {
    client: "postgresql",
    connection: process.env.DB_CONNECTION_URL,
  },
};
