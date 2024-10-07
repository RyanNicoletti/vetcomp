import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getAllJobsQuerySchema } from "../schemas/jobsSchema";
import { BadRequestError, InternalServerError } from "../errors/httpErrors";
import { jobsService } from "../services/jobsService";
import { db } from "../db/connection";

interface JobQueryParams {
  jobTitleSearch?: string;
  companySearch?: string;
  locationSearch?: string;
  jobType?: string[];
}

const getAllJobs = asyncHandler(async (req: Request, res: Response) => {
  const queryParamsResult = getAllJobsQuerySchema.safeParse(req.query);
  if (!queryParamsResult.success) {
    throw new BadRequestError("Invalid search params, please try again");
  }
  const queryParams: JobQueryParams = queryParamsResult.data;
  const jobs = await jobsService.getAll(db, queryParams);
  if (!jobs) {
    throw new InternalServerError("Unable to get jobs, please try again.");
  }
  res.json(jobs);
});

export default { getAllJobs };
