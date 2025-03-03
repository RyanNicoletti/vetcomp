import { z } from "zod";

export const JobApplicationSchema = z.object({
  id: z.string().uuid(),
  job_id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  resume_url: z.string().optional(),
  resume_name: z.string().optional(),
  status: z.enum(["pending", "viewed", "contacted"]),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export const JobApplicationFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional().nullable(),
});

export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type JobApplicationForm = z.infer<typeof JobApplicationFormSchema>;
