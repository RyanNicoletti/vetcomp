import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { db } from "../db/connection";
import adminService from "../services/adminService";

const getUsersWithCompensations = asyncHandler(
  async (req: Request, res: Response) => {
    const usersWithCompensations = await adminService.getUsersWithCompensations(
      db
    );
    res.status(200).json(usersWithCompensations);
  }
);

const getAllJobsWithUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const jobs = await adminService.getAllJobsWithUsers(db);
    res.status(200).json(jobs);
  }
);

const deleteJobById = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.params.id;
  await adminService.deleteJobById(db, jobId);
  res.status(200).json({ message: "Job deleted successfully" });
});

export default {
  getUsersWithCompensations,
  deleteJobById,
  getAllJobsWithUsers,
};
