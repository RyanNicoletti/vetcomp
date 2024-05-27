import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import salariesRouter from "./salaries/salaries.router";
import locationsRouter from "./locations/locations.router";
import "dotenv/config";

const app: Express = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://veterinarycomp.com"],
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

app.use("/salaries", salariesRouter);
app.use("/locations", locationsRouter);

export default app;
