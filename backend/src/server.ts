import app from "./app";

const PORT: number = parseInt(process.env.PORT!) || 3000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
