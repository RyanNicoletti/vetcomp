import { Request, Response } from "express";
import { db } from "../db/connection";
import jobsService from "../services/jobsService";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/httpErrors";
import {
  JobFormSchema,
  JobQuerySchema,
  JobSchema,
} from "../schemas/jobSchemas";
import { z } from "zod";
import stripeService from "../services/stripeService";

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

  const job = await jobsService.getById(db, jobId, req.session.userId);
  if (!job) {
    throw new BadRequestError("Job not found");
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

const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new UnauthorizedError("Must be logged in to cancel jobs");
  }

  const jobId = req.params.id;
  const job = await jobsService.getById(db, jobId, req.session.userId);

  if (!job) {
    throw new NotFoundError("Job not found");
  }

  await stripeService.cancelSubscriptionImmediately(job.subscription_id);

  res.json({ message: "Job cancelled successfully" });
});

export default {
  getAll,
  getJobById,
  getUserJobs,
  cancelSubscription,
};
