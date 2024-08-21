import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password_hash: z.string(),
  is_verified: z.boolean(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
