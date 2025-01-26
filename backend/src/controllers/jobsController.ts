import { Request, Response } from "express";
import { db } from "../db/connection";
import jobsService from "../services/jobsService";
import { asyncHandler } from "../middleware/asyncHandler";
import { BadRequestError } from "../errors/httpErrors";
import { JobQuerySchema, JobSchema } from "../schemas/jobSchemas";
import { z } from "zod";

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
    throw new BadRequestError("Job not found");
  }

  res.json(job);
});

const createJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new BadRequestError("Must be logged in to post a job");
  }

  const validatedData = JobSchema.parse(req.body);

  const jobData = {
    ...validatedData,
    user_id: req.session.userId,
  };

  const newJob = await jobsService.create(db, jobData);
  res.status(201).json(newJob);
});

export default {
  getAll,
  getJobById,
  createJob,
};
