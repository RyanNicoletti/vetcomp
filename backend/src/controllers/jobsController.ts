import { Request, Response } from "express";
import { db } from "../db/connection";
import jobsService from "../services/jobsService";
import { asyncHandler } from "../middleware/asyncHandler";
import { BadRequestError } from "../errors/httpErrors";

const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const filters = {
    page,
    searchTerm: req.query.search as string,
    practiceType: req.query.practiceType as string,
    locationType: req.query.locationType as string,
  };

  const jobsWithPagination = await jobsService.getAll(db, filters);
  res.json(jobsWithPagination);
});

const getJobById = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobsService.getById(db, req.params.id);
  if (!job) {
    throw new BadRequestError("Job not found");
  }
  res.json(job);
});

const createJob = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    throw new BadRequestError("Must be logged in to post a job");
  }

  const jobData = {
    ...req.body,
    user_id: req.session.userId,
  };

  const newJob = await jobsService.create(db, jobData);
  res.status(201).json(newJob);
});

export default {
  getAllJobs,
  getJobById,
  createJob,
};
