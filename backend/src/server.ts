import app from "./app";
import knex from "./db/connection";

const PORT: number = parseInt(process.env.PORT!) || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// knex.migrate
//   .latest()
//   .then((migrations) => {
//     console.log("migrations", migrations);
//     app.listen(PORT, listener);
//   })
//   .catch((error) => {
//     console.error(error);
//     knex.destroy();
//   });
