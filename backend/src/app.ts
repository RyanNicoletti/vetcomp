import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import knex from "./db/connection";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import compensationController from "./controllers/compensationController";
import locationsController from "./controllers/locationsController";
import loginController from "./controllers/loginController";
import usersController from "./controllers/usersController";

const app: Express = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://veterinarycomp.com"],
  credentials: true,
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

let redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.connect().catch(console.error);

let redisStore = new RedisStore({
  client: redisClient,
});

const sess = {
  secret: process.env.SESSION_SECRET as string | string[],
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as boolean | "none" | "lax" | "strict" | undefined)
        : ("lax" as boolean | "none" | "lax" | "strict" | undefined),
  },
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy (CF)
}

app.use(session(sess));

// Routes
// User routes
app.post("/users", usersController.createUser);

// Login routes
app.post("/login", loginController.login);

// Location routes
app.get("/locations", locationsController.getLocations);

// Compensation routes
app.get("/salaries", compensationController.getAllSalaries);
app.post("/salaries", compensationController.createCompensation);

export default app;
