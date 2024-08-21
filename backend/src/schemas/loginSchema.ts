import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email or password."),
  password: z.string().min(6, "Invalid email or password."),
});

export type UserLogin = z.infer<typeof loginSchema>;
