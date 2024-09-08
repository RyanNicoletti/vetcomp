import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  password_hash: z.string().nullable(),
  is_verified: z.boolean(),
  is_admin: z.boolean(),
  reset_token: z.string().nullable(),
  reset_token_expiry: z.date().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
