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

export default {
  getUsersWithCompensations
};
