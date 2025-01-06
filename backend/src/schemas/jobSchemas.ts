import { z } from "zod";

const JobType = z.enum(["full-time", "part-time", "contract", "relief"]);
const JobStatus = z.enum(["active", "expired", "draft"]);

export const CreateJobSchema = z
  .object({
    title: z.string().min(1, "Job title is required"),
    company: z.string().min(1, "Company name is required"),
    location: z.string().min(1, "Location is required"),
    type: JobType,
    practice_type: z.string().min(1, "Practice type is required"),
    salary_min: z.number().positive("Minimum salary must be greater than 0"),
    salary_max: z.number().positive("Maximum salary must be greater than 0"),
    sign_on_bonus: z.number().nullable(),
    description: z.string().min(1, "Job description is required"),
    requirements: z.string().nullable(),
    benefits: z.string().nullable(),
    application_url: z.string().url().nullable(),
    contact_email: z.string().email("Invalid email address"),
  })
  .refine((data) => data.salary_max > data.salary_min, {
    message: "Maximum salary must be greater than minimum salary",
    path: ["salary_max"],
  });

export const JobQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1))
    .pipe(z.number().positive()),
  rowsPerPage: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10))
    .pipe(z.number().positive()),
  companySearch: z.string().optional(),
  locationSearch: z.string().optional(),
  practiceType: z.string().optional(),
  type: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;
export type JobQueryParams = z.infer<typeof JobQuerySchema>;
