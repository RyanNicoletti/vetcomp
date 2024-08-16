import express, { Express, Request, Response, NextFunction } from "express";
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
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

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
