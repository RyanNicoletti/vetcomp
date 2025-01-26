import { z } from "zod";

// Base enums
const JobType = z.enum(["full-time", "part-time", "contract", "relief"]);
const JobStatus = z.enum(["active", "expired", "draft"]);
const ApplicationMethod = z.enum(["email", "external"]);

// Base validation refinements
const salaryRefinement = (data: any) => data.salary_max > data.salary_min;
const experienceRefinement = (data: any) => {
  if (data.experience_min && data.experience_max) {
    return data.experience_max >= data.experience_min;
  }
  return true;
};
const applicationMethodRefinement = (data: any) => {
  if (data.application_method === "email") {
    return !!data.contact_email;
  }
  if (data.application_method === "external") {
    return !!data.application_url;
  }
  return true;
};

// The schema for job records in the database
export const JobSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  type: JobType,
  practice_type: z.string(),
  salary_min: z.number(),
  salary_max: z.number(),
  sign_on_bonus: z.number().nullable(),
  experience_min: z.number().min(0).nullable(),
  experience_max: z.number().min(0).nullable(),
  description: z.string(),
  requirements: z.string().nullable(),
  benefits: z.string().nullable(),
  application_method: ApplicationMethod,
  contact_email: z.string().email().nullable(),
  application_url: z.string().url().nullable(),
  status: JobStatus,
  subscription_id: z.string(),
  customer_id: z.string(),
});

const convertCurrencyToNumber = (value: string | number): number => {
  if (typeof value === "number") return value;
  return Number(value.replace(/[^0-9.-]+/g, ""));
};

export const StripeJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  type: JobType,
  practiceType: z.string().min(1, "Practice type is required"),
  salaryMin: z
    .union([z.string(), z.number()])
    .transform((val) =>
      typeof val === "string" ? convertCurrencyToNumber(val) : val
    ),
  salaryMax: z
    .union([z.string(), z.number()])
    .transform((val) =>
      typeof val === "string" ? convertCurrencyToNumber(val) : val
    ),
  signOnBonus: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((val) =>
      val
        ? typeof val === "string"
          ? convertCurrencyToNumber(val)
          : val
        : null
    ),
  experienceMin: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  experienceMax: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : null)),
  description: z.string().min(1, "Job description is required"),
  requirements: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  applicationMethod: z.enum(["email", "external"]),
  contactEmail: z.string().email().optional().nullable(),
  applicationUrl: z.string().url().optional().nullable(),
  status: z.enum(["active", "expired", "draft"]),
  subscription_id: z.string(),
  customer_id: z.string(),
  user_id: z.string(),
});

// Query parameters schema
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

export type JobRecord = z.infer<typeof JobSchema>;
export type JobQueryParams = z.infer<typeof JobQuerySchema>;
export type StripeJobInput = Omit<JobRecord, "id" | "posted_date">;
