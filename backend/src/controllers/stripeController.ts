import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import stripeService from "../services/stripeService";
import { db } from "../db/connection";
import { BadRequestError, UnauthorizedError } from "../errors/httpErrors";
import jobsService from "../services/jobsService";
import { redisClient } from "../../config/redisConfig";
import { IJobFormData, JobRecord } from "../../../shared-types/types";
import { JobFormSchema } from "../schemas/jobSchemas";
import userService from "../services/userService";

interface CheckoutRequestBody {
  jobData: IJobFormData;
  pricePerMonth: number;
}

const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobData, pricePerMonth } = req.body as CheckoutRequestBody;

    if (!jobData || !pricePerMonth) {
      throw new BadRequestError("Invalid request data");
    }

    const user = await userService.getById(db, req.session.userId);
    if (!user || !user.email) {
      throw new BadRequestError("User not found");
    }

    const validatedData = JobFormSchema.parse({
      ...jobData,
      status: "active",
      user_id: req.session.userId!,
    });

    const transformedJobData: Omit<
      JobRecord,
      "customer_id" | "subscription_id" | "id"
    > = {
      user_id: validatedData.user_id,
      title: validatedData.title,
      company: validatedData.company,
      location: validatedData.location,
      type: validatedData.type,
      practice_type: validatedData.practiceType,
      salary_min: validatedData.salaryMin,
      salary_max: validatedData.salaryMax,
      sign_on_bonus: validatedData.signOnBonus ?? null,
      experience_min: validatedData.experienceMin,
      experience_max: validatedData.experienceMax,
      description: validatedData.description,
      requirements: validatedData.requirements ?? null,
      benefits: validatedData.benefits ?? null,
      application_method: validatedData.applicationMethod,
      contact_email: validatedData.contactEmail ?? null,
      application_url: validatedData.applicationUrl ?? null,
      status: "active",
    };

    const session = await stripeService.createCheckoutSession(
      transformedJobData,
      pricePerMonth,
      user.email
    );

    await redisClient.set(
      `pending_job:${session.id}`,
      JSON.stringify(transformedJobData),
      { EX: 3600 } // 1 hour expiration
    );

    res.json({ clientSecret: session.client_secret });
  }
);

const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    throw new BadRequestError("Checkout Session ID not found");
  }

  const session = await stripeService.retrieveSession(session_id);

  if (session.payment_status === "paid") {
    const jobDataString = await redisClient.get(`pending_job:${session_id}`);

    if (jobDataString) {
      const validatedNewJob: JobRecord = JSON.parse(jobDataString);
      const newJob = await jobsService.create(db, validatedNewJob);
      await redisClient.del(`pending_job:${session_id}`);

      res.json({
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
        job: newJob,
      });
    } else {
      res.json({
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
      });
    }
  } else {
    res.json({
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
    });
  }
});

const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    throw new BadRequestError("No signature provided");
  }

  await stripeService.handleWebhookEvent(req.body, sig, db);
  res.json({ received: true });
});

const createCustomerPortalSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobId } = req.body;

    if (!req.session.userId) {
      throw new UnauthorizedError("You must be logged in to access this page");
    }

    if (!jobId) {
      throw new BadRequestError("Job ID is required");
    }

    const portalSession = await stripeService.createCustomerPortalSession(
      db,
      jobId,
      req.session.userId
    );

    res.json(portalSession);
  }
);

export default {
  createCheckoutSession,
  handleWebhook,
  getSession,
  createCustomerPortalSession,
};
