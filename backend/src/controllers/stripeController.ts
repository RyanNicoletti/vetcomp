import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import stripeService from "../services/stripeService";
import { JobFormData, PricingOption } from "../types/jobsTypes";
import { db } from "../db/connection";
import { BadRequestError } from "../errors/httpErrors";
import jobsService from "../services/jobsService";
import Stripe from "stripe";
import { redisClient } from "../../config/redisConfig";

interface CheckoutRequestBody {
  jobData: JobFormData;
  priceOption: PricingOption;
}

const createCheckoutSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { jobData, priceOption } = req.body as CheckoutRequestBody;

    if (!jobData || !priceOption) {
      throw new BadRequestError("Missing required data");
    }

    const session = await stripeService.createCheckoutSession(
      jobData,
      priceOption
    );

    res.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  }
);

const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    return res.status(400).send("No signature provided");
  }

  await stripeService.handleWebhookEvent(req.body, sig, db);
  res.json({ received: true });
});

const getSession = asyncHandler(async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    throw new BadRequestError("Session ID is required");
  }

  const session = await stripeService.retrieveSession(session_id);
  res.json({
    status: session.status,
    customer_email: session.customer_details?.email,
  });
});

export default { createCheckoutSession, handleWebhook, getSession };
