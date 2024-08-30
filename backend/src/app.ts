import express, { Express, Router } from "express";
import session from "express-session";
import RedisStore from "connect-redis";
import { redisClient } from "../config/redisConfig";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import compensationController from "./controllers/compensationController";
import locationsController from "./controllers/locationsController";
import usersController from "./controllers/usersController";
import "dotenv/config";
import authController from "./controllers/authController";

const app: Express = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://veterinarycomp.com"],
  credentials: true,
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());

let redisStore = new RedisStore({
  client: redisClient,
});

const sess = {
  secret: process.env.SESSION_SECRET as string | string[],
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  genid: () => {
    return crypto.randomUUID();
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24,
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("none" as boolean | "none" | "lax" | "strict" | undefined)
        : ("none" as boolean | "none" | "lax" | "strict" | undefined),
  },
};
if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy (CF)
}

app.use(session(sess));

// Routes

// Admin Routes
const adminRouter: Router = express.Router();
adminRouter.use(isAdmin);
adminRouter.get("/compensations", compensationController.getAllSalaries);
// adminRouter.delete(
//   "/compensations/:id",
//   compensationController.deleteCompensationById
// );
// adminRouter.patch(
//   "/compensations/:id/verify",
//   compensationController.verifyCompensationById
// );
// adminRouter.patch(
//   "/compensations/:id/approve",
//   compensationController.approveCompensationById
// );
app.use("/admin", adminRouter);

// User routes
const usersRouter: Router = express.Router();
usersRouter.post("/", usersController.createUser);
usersRouter.post("/verify-email", usersController.verifyEmail);
usersRouter.post("/login", usersController.login);
usersRouter.post("/logout", usersController.logout);
app.use("/users", usersRouter);

// Auth
app.get("/authStatus", authController.getAuthStatus);
app.get("/adminStatus", authController.getAdminStatus);

// Location routes
app.get("/locations", locationsController.getLocations);

// Compensation routes
const compensationsRouter: Router = express.Router();
compensationsRouter.get("/", compensationController.getAllSalaries);
compensationsRouter.post("/", compensationController.createCompensation);
app.use("/compensations", compensationsRouter);

export default app;
