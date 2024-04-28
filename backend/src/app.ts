import express, { Express, Request, Response } from "express";
import cors from "cors";
import salariesRouter from "./salaries/salaries.router";
import "dotenv/config";

const app: Express = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://veterinarycomp.com"],
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/salaries", salariesRouter);

export default app;
