import Stripe from "stripe";
import { JobFormData, PricingOption } from "../types/jobsTypes";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "api_key_placeholder", {
  telemetry: false,
});

const stripeService = {
  createCheckoutSession: async (
    jobData: JobFormData,
    priceOption: PricingOption
  ) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        success_url: `${process.env.FRONTEND_URL}/jobs/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/jobs/payment`,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Job post for ${jobData.title} at ${jobData.company} `,
                description: `Job post on veterinarycomp.com for ${jobData.title} at ${jobData.company}`,
              },
              unit_amount: priceOption.price * 100,
            },
            quantity: 1,
          },
        ],
        metadata: {
          jobTitle: jobData.title,
          company: jobData.company,
          duration: priceOption.months,
        },
      });

      return session;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },
};

export default stripeService;
