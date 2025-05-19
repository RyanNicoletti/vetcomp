import { Request, Response } from "express";
import { db } from "../db/connection";
import jobsService from "../services/jobsService";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/httpErrors";
import { JobQuerySchema, JobFormSchema } from "../schemas/jobSchemas";
import { z } from "zod";
import stripeService from "../services/stripeService";
import { JobRecord } from "../../../shared-types/types";

const getAll = asyncHandler(async (req: Request, res: Response) => {
  const query = JobQuerySchema.parse(req.query);
  const practiceTypeArray = query.practiceType?.length
    ? query.practiceType?.split(",")
    : undefined;
  const typeFilterArray = query.type?.length
    ? query.type?.split(",")
    : undefined;
  const filters = {
    page: query.page,
    rowsPerPage: query.rowsPerPage,
    companySearch: query.companySearch,
    locationSearch: query.locationSearch,
    practiceTypeFilter: practiceTypeArray,
    typeFilter: typeFilterArray,
  };

  const jobsWithPagination = await jobsService.getAllJobs(db, filters);
  res.json(jobsWithPagination);
});

const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const jobId = z.string().uuid("Invalid job ID").parse(req.params.id);

  const job = await jobsService.getById(db, jobId);
  if (!job) {
    throw new BadRequestError("Job not found or no longer active");
  }

  res.json(job);
});

const getUserJobs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new UnauthorizedError("Must be logged in to view jobs");
  }

  const jobs = await jobsService.getUserJobs(db, req.session.userId);
  res.json(jobs);
});

const createJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new UnauthorizedError("Must be logged in to create jobs");
  }

  const validatedData = JobFormSchema.parse({
    ...req.body,
    status: "active",
    user_id: req.session.userId,
  });

  const transformedJobData: Omit<JobRecord, "id"> = {
    user_id: validatedData.user_id,
    title: validatedData.title,
    company: validatedData.company,
    location: validatedData.location,
    type: validatedData.type,
    practice_type: validatedData.practiceType,
    salary_min: validatedData.salaryMin,
    salary_max: validatedData.salaryMax,
    sign_on_bonus: validatedData.signOnBonus ?? null,
    experience_min: validatedData.experienceMin,
    experience_max: validatedData.experienceMax,
    description: validatedData.description,
    requirements: validatedData.requirements ?? null,
    benefits: validatedData.benefits ?? null,
    application_method: validatedData.applicationMethod,
    contact_email: validatedData.contactEmail ?? null,
    application_url: validatedData.applicationUrl ?? null,
    status: "active",
    customer_id: null,
    subscription_id: null,
  };

  const newJob = await jobsService.create(db, transformedJobData);

  res.status(201).json({
    message: "Job posted successfully!",
    job: newJob,
  });
});

const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new UnauthorizedError("Must be logged in to cancel jobs");
  }

  const jobId = req.params.id;
  const job = await jobsService.getById(db, jobId);

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  if (job.subscription_id) {
    await stripeService.cancelSubscriptionImmediately(job.subscription_id);
  } else {
    // For free jobs, just update status to expired
    await jobsService.updateJobStatus(db, jobId, "expired");
  }

  res.json({ message: "Job cancelled successfully" });
});

export default {
  getAll,
  getJobById,
  getUserJobs,
  createJob,
  cancelSubscription,
};
