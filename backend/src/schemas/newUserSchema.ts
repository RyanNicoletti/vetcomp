import { z } from "zod";

export const NewUserSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password must not exceed 64 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]*$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&.,)"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type NewUser = z.infer<typeof NewUserSchema>;
