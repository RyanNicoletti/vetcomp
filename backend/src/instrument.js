import * as Sentry from "@sentry/node";

const sentryOptions = {
  dsn: "https://9886282fb67bc560a0446f99c634b3b1@o4508044398624768.ingest.us.sentry.io/4508044401901568",
  tracesSampleRate: 1.0,
  profilesSampleRate: 0.0,
};

if (process.env.NODE_ENV === "production") {
  try {
    const { nodeProfilingIntegration } = require("@sentry/profiling-node");
    sentryOptions.integrations = [nodeProfilingIntegration()];
    sentryOptions.profilesSampleRate = 1.0;
    console.log("Sentry profiling enabled");
  } catch (error) {
    console.warn("Failed to initialize Sentry profiling:", error.message);
  }
}

Sentry.init(sentryOptions);
