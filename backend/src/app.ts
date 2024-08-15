import express, { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import compensationRouter from "./routes/compensationRouter";
import locationsRouter from "./routes/locationsRouter";
import "dotenv/config";
import registerRouter from "./routes/registerRouter";
import loginRouter from "./routes/loginRouter";

const app: Express = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://veterinarycomp.com"],
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

app.use("/salaries", compensationRouter);
app.use("/locations", locationsRouter);
app.use("/users", usersRouter);
app.use("/login", loginRouter);

export default app;
