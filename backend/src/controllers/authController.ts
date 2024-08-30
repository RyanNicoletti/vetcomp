import { Request, Response } from "express";
import userService from "../services/userService";
import { db } from "../db/connection";

const getUserStatus = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    return res.status(200).json({ isAuthenticated: false, isAdmin: false });
  }

  try {
    const user = await userService.getById(db, req.session.userId);
    if (!user) {
      return res.status(200).json({ isAuthenticated: false, isAdmin: false });
    }

    return res.status(200).json({
      isAuthenticated: true,
      isAdmin: user.is_admin,
    });
  } catch (error) {
    console.error("Error in getUserStatus:", error);
    return res.status(500).json({
      isAuthenticated: false,
      isAdmin: false,
      message: "Internal server error",
    });
  }
};

export default { getUserStatus };
