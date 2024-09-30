import "instrument.js";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
import authController from "./controllers/authController";
import { isAdmin } from "./middleware/isAdmin";
import { errorHandler } from "./middleware/errorHandler";
import * as Sentry from "@sentry/node";

const app: Express = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://veterinarycomp.com",
    "https://www.veterinarycomp.com",
  ],
  credentials: true,
};

app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "veterinarycomp:",
});

const sess = {
  secret: process.env.SESSION_SECRET as string | string[],
  store: redisStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: process.env.NODE_ENV === "production" ? "none" : false,
  } as express.CookieOptions,
};
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy (CF)
}

app.use(session(sess));

/**
 *
 * ROUTES
 *
 */

// Admin Routes
const adminRouter: Router = express.Router();
adminRouter.use(isAdmin);
adminRouter.get(
  "/compensations",
  compensationController.getAllAdminCompensations
);
adminRouter.delete(
  "/compensations/:id",
  compensationController.deleteCompensationById
);
adminRouter.patch(
  "/compensations/:id/verify",
  compensationController.verifyCompensationById
);
adminRouter.patch(
  "/compensations/:id/approve",
  compensationController.approveCompensationById
);
app.use("/admin", adminRouter);

// User routes
const usersRouter: Router = express.Router();
usersRouter.post("/", usersController.createUser);
usersRouter.post(
  "/forgot-password/verify",
  usersController.forgotPwVerifyEmail
);
usersRouter.post("/reset-password", usersController.resetPassword);
usersRouter.post("/verify-email", usersController.verifyEmail);
usersRouter.post("/login", usersController.login);
usersRouter.post("/logout", usersController.logout);
app.use("/users", usersRouter);

// Check for authentication/admin status
app.get("/userStatus", authController.getUserStatus);

// Location routes
app.get("/locations", locationsController.getLocations);

// Compensation routes
const compensationsRouter: Router = express.Router();
compensationsRouter.get("/", compensationController.getAllSalaries);
compensationsRouter.get(
  "/profile",
  compensationController.getProfileCompensations
);
compensationsRouter.post("/", compensationController.createCompensation);
compensationsRouter.post(
  "/:compId/upload-verification",
  compensationController.uploadVerificationDocument
);
app.use("/compensations", compensationsRouter);

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

Sentry.setupExpressErrorHandler(app);

// error handler middleware
app.use(errorHandler);

export default app;
