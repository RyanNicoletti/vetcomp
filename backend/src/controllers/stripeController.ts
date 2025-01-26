import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import stripeService from "../services/stripeService";
import { db } from "../db/connection";
import { BadRequestError } from "../errors/httpErrors";
import jobsService from "../services/jobsService";
import { redisClient } from "../../config/redisConfig";
import { IJobFormInput, JobFormSchema } from "../schemas/jobSchemas";
import userService from "../services/userService";
import { IJobFormData, JobRecord } from "../../../shared-types/types";

interface CheckoutRequestBody {
  jobData: IJobFormData;
  pricePerMonth: number;
}

const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { jobData, pricePerMonth } = req.body as CheckoutRequestBody;

      if (!jobData || !pricePerMonth) {
        throw new BadRequestError(
          "Unexpected error when processing payment, please try again later, you will not be charged for this transaction"
        );
      }

      const user = await userService.getById(db, req.session.userId);
      if (!user || !user.email) {
        throw new BadRequestError(
          "User not found, make sure you are logged in and try again."
        );
      }
      const userEmail = user?.email;

      const validatedData: IJobFormInput = JobFormSchema.parse({
        ...jobData,
        status: "active",
        user_id: req.session.userId!,
      });

      const partialJobRecord: Omit<
        JobRecord,
        "customer_id" | "subscription_id"
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
        partialJobRecord,
        pricePerMonth,
        userEmail
      );

      res.json({
        clientSecret: session.client_secret,
        sessionId: session.id,
      });
    } catch (error) {
      console.error(
        "Error in stripe controller, possibly with job form validation?: ",
        error
      );
      throw new BadRequestError("Error validating job form, please try again");
    }
  }
);

const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    throw new BadRequestError("Checkout Session ID not found");
  }

  try {
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
  } catch (error) {
    console.error("Error retrieving session:", error);
    throw new BadRequestError("Error retrieving checkout session");
  }
});

const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).send("No signature provided");
  }

  await stripeService.handleWebhookEvent(req.body, sig, db);
  res.json({ received: true });
});

export default { createCheckoutSession, handleWebhook, getSession };
