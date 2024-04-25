import express, { Express, Request, Response } from "express";
import salariesRouter from "./salaries/salaries.router";
import "dotenv/config";

const app: Express = express();
app.use(express.json());

app.use("/salaries", salariesRouter);

export default app;
