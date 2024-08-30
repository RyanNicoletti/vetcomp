import { Request, Response } from "express";
import userService from "../services/userService";
import { db } from "../db/connection";

const getAuthStatus = (req: Request, res: Response) => {
  if (req.session && req.session.userId) {
    return res.status(200).json({ isAuthenticated: true });
  } else {
    return res.status(200).json({ isAuthenticated: false });
  }
};

const getAdminStatus = async (req: Request, res: Response) => {
  try {
    if (!req.session || !req.session.userId) {
      return res
        .status(401)
        .json({ isAdmin: false, message: "User not authenticated" });
    }
    const user = await userService.getById(db, req.session.userId);
    if (!user) {
      return res
        .status(404)
        .json({ isAdmin: false, message: "User not found" });
    }
    res.json({ isAdmin: user.is_admin });
  } catch (error) {
    console.error("Error in getAdminStatus:", error);
    res.status(500).json({ isAdmin: false, message: "Internal server error" });
  }
};

export default { getAuthStatus, getAdminStatus };
