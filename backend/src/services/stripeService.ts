import Stripe from "stripe";
import { redisClient } from "../../config/redisConfig";
import { Knex } from "knex";
import { IJobFormData, JobRecord } from "../../../shared-types/types";
import { IJobFormInput } from "../schemas/jobSchemas";
import emailService from "./emailService";

const stripe = new Stripe(process.env.STRIPE_API_KEY || "api_key_placeholder", {
  telemetry: false,
});

const stripeService = {
  createCheckoutSession: async (
    newJob: Omit<JobRecord, "customer_id" | "subscription_id" | "id">,
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
                name: "Veterinarycomp.com Job Advertisement",
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

      const validatedJobRecord: Omit<JobRecord, "id"> = {
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
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw new Error("Invalid signature");
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          const existingJob = await db("jobs")
            .where({ subscription_id: session.subscription as string })
            .first();

          if (!existingJob) {
            const jobDataString = await redisClient.get(
              `pending_job:${session.id}`
            );
            if (!jobDataString) {
              console.error("Job data not found for session:", session.id);
              return;
            }

            const jobData = JSON.parse(jobDataString);

            const [newJob] = await db.transaction(async (trx) => {
              return await trx("jobs")
                .insert({
                  ...jobData,
                  subscription_id: session.subscription as string,
                  customer_id: session.customer as string,
                })
                .returning("*");
            });

            await emailService.sendJobPostConfirmationEmail({
              email: session.customer_details?.email || "",
              jobDetails: newJob,
              subscriptionDetails: {
                amount: session.amount_total ? session.amount_total / 100 : 99,
                interval: "month",
              },
            });

            await redisClient.del(`pending_job:${session.id}`);
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          await db("jobs")
            .where({ subscription_id: invoice.subscription })
            .update({ status: "payment_failed" });

          // TODO: Send email notification to user
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          await db.transaction(async (trx) => {
            await trx("jobs")
              .where({ subscription_id: subscription.id })
              .update({
                status: "expired",
              });
          });
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          await db("jobs")
            .where({ subscription_id: subscription.id })
            .update({
              status: subscription.status === "active" ? "active" : "inactive",
            });
          break;
        }
      }
    } catch (err) {
      console.error("Error processing webhook:", err);
      throw err;
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

  cancelSubscriptionImmediately: async (subscriptionId: string) => {
    try {
      await stripe.subscriptions.cancel(subscriptionId, {
        prorate: true,
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  },
};

export default stripeService;
