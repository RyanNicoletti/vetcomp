import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import stripeService from "../services/stripeService";
import { JobFormData, PricingOption } from "../types/jobsTypes";

interface CheckoutRequestBody {
  jobData: JobFormData;
  priceOption: PricingOption;
}

const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { jobData, priceOption } = req.body as CheckoutRequestBody;

  const session = await stripeService.createCheckoutSession(
    jobData,
    priceOption
  );
  res.json({ sessionId: session.id });
});

export default { createCheckout };
