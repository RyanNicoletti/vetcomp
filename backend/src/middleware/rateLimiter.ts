import rateLimit from "express-rate-limit";

const tooManyRequests = {
  error: {
    message: "Too many attempts from this IP. Please try again later.",
    status: 429,
  },
};

// Strict limiter for sensitive credential operations (login, password reset
// request/confirmation, email verification). Mitigates brute-force attacks
// against passwords, reset tokens, and verification codes.
//
// NOTE: this uses the default in-memory store, so limits are per-instance and
// reset on restart. If the API is ever scaled to multiple instances, back this
// with the existing Redis client (e.g. via `rate-limit-redis`).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequests,
});

// Looser limiter for account creation, which triggers a verification email.
// Curbs signup abuse / email bombing without blocking legitimate signups.
export const accountCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequests,
});
