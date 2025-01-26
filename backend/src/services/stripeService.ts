import Stripe from "stripe";
import { redisClient } from "../../config/redisConfig";
import { Knex } from "knex";
import { IJobFormData, JobRecord } from "../../../shared-types/types";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "api_key_placeholder", {
  telemetry: false,
});

const stripeService = {
  createCheckoutSession: async (
    newJob: Omit<JobRecord, "customer_id" | "subscription_id">,
    pricePerMonth: number,
    userEmail: string
  ) => {
    try {
      if (!pricePerMonth || isNaN(pricePerMonth)) {
        throw new Error("Invalid price amount");
      }

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "subscription",
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Monthly Job Posting Subscription",
                description: `Job post for ${newJob.title} at ${newJob.company}`,
              },
              unit_amount: Math.round(pricePerMonth * 100),
              recurring: {
                interval: "month",
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          jobTitle: newJob.title,
          company: newJob.company,
        },
        return_url: `http://${process.env.FRONTEND_URL}/jobs/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      });

      const validatedJobRecord: JobRecord = {
        ...newJob,
        customer_id: session.customer as string,
        subscription_id: session.subscription as string,
      };

      await redisClient.set(
        `pending_job:${session.id}`,
        JSON.stringify(validatedJobRecord),
        { EX: 3600 } // expire in 1 hour
      );

      return session;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  },

  handleWebhookEvent: async (rawBody: Buffer, signature: string, db: Knex) => {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        console.log("we go there");
        const session = event.data.object as Stripe.Checkout.Session;

        const jobDataString = await redisClient.get(
          `pending_job:${session.id}`
        );
        if (!jobDataString) {
          console.error("Job data not found in Redis");
          return;
        }

        const jobData = JSON.parse(jobDataString);

        await db.transaction(async (trx) => {
          await trx("jobs").insert({
            ...jobData,
            subscription_id: session.subscription as string,
            customer_id: session.customer as string,
            status: "active",
            expires_at: db.raw("NOW() + INTERVAL '? months'", [
              session.metadata?.months || 1,
            ]),
          });
        });

        // clean up redis
        await redisClient.del(`pending_job:${session.id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db("jobs")
          .where({ subscription_id: subscription.id })
          .update({ status: "expired" });
        break;
      }
    }
  },

  retrieveSession: async (sessionId: string) => {
    try {
      return await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error("Error retrieving session:", error);
      throw error;
    }
  },
};

export default stripeService;
