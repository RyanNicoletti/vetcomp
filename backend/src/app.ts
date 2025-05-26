import "./instrument.js";
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
import jobsController from "./controllers/jobsController.js";
import stripeController from "./controllers/stripeController.js";
import jobApplicationsController from "./controllers/jobApplicationController.js";
import adminController from "./controllers/adminController.js";

const app: Express = express();

const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  credentials: true,
};

// stripe middleware
app.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeController.handleWebhook
);

app.use(
  helmet({
    hidePoweredBy: true,
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  })
);
app.use(morgan("dev"));
app.use(cors(corsOptions));

app.use(express.json());

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "veterinarycomp:session:",
  ttl: 24 * 60 * 60,
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
    sameSite: process.env.NODE_ENV === "production" ? "lax" : false,
    domain:
      process.env.NODE_ENV === "production"
        ? process.env.COOKIE_DOMAIN
        : undefined,
  } as express.CookieOptions,
};
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy (CF)
}

app.use(session(sess));

/**
 *
 * ADMIN
 *
 */
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
adminRouter.get("/users", adminController.getUsersWithCompensations);
app.use("/admin", adminRouter);

/**
 *
 * USERS
 *
 */
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

/**
 *
 * COMPENSATION
 *
 */
const compensationsRouter: Router = express.Router();
compensationsRouter.get("/", compensationController.getPaginatedCompensations);
compensationsRouter.get("/all", compensationController.getAllCompensations);
compensationsRouter.get(
  "/profile",
  compensationController.getProfileCompensations
);
compensationsRouter.get(
  "/by-location",
  compensationController.getLocationCompensations
);
compensationsRouter.post("/", compensationController.createCompensation);
compensationsRouter.post(
  "/:compId/upload-verification",
  compensationController.uploadVerificationDocument
);
app.use("/compensations", compensationsRouter);

/**
 *
 * JOBS
 *
 */
const jobsRouter: Router = express.Router();
// General job routes
jobsRouter.get("/", jobsController.getAll);
jobsRouter.get("/profile", jobsController.getUserJobs);
jobsRouter.post("/", jobsController.createJob);

// Job applications routes (grouped together and before /:id)
jobsRouter.get(
  "/applications/resume/:resumeId",
  jobApplicationsController.downloadResume
);
jobsRouter.get("/applications", jobApplicationsController.getUserApplications);
jobsRouter.patch(
  "/applications/:applicationId/status",
  jobApplicationsController.updateApplicationStatus
);
jobsRouter.post("/:jobId/apply", jobApplicationsController.submitApplication);
jobsRouter.get(
  "/:jobId/applications",
  jobApplicationsController.getApplicationsForJob
);
jobsRouter.delete(
  "/applications/:applicationId",
  jobApplicationsController.deleteApplication
);

// Individual job routes (come last because of the :id parameter)
jobsRouter.get("/:id", jobsController.getJobById);
jobsRouter.delete("/:id/cancel", jobsController.cancelSubscription);

app.use("/jobs", jobsRouter);

/**
 *
 * STRIPE
 *
 */
const stripeRouter: Router = express.Router();
stripeRouter.post("/checkout", stripeController.createCheckoutSession);
stripeRouter.get("/session-status", stripeController.getSession);
stripeRouter.post(
  "/customer-portal",
  stripeController.createCustomerPortalSession
);
app.use("/stripe", stripeRouter);

Sentry.setupExpressErrorHandler(app);

// error handler middleware
app.use(errorHandler);

export default app;
