import { Request, Response } from "express";
import userService from "../services/userService";
import { db } from "../db/connection";
import { asyncHandler } from "../middleware/asyncHandler";

const getUserStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ isAuthenticated: false, isAdmin: false });
  }

  const user = await userService.getById(db, req.session.userId);

  if (!user) {
    return res
      .status(200)
      .json({ isAuthenticated: false, isAdmin: false, email: null });
  }

  res.status(200).json({
    isAuthenticated: true,
    isAdmin: user.is_admin,
    email: user.email,
  });
});

export default { getUserStatus };
