import z from "zod";

export const getAllJobsQuerySchema = z.object({
  jobTitleSearch: z.string().optional(),
  companySearch: z.string().optional(),
  locationSearch: z.string().optional(),
  jobType: z.string().array().optional(),
});
