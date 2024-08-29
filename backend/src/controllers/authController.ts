import { Request, Response } from "express";
import userService from "../services/userService";
import { isAuthenticated } from "../middleware/isAuthenticated";

const getAuthStatus = (req: Request, res: Response) => {
  if (req.session && req.session.userId) {
    return res.status(200).json({ isAuthenticated: true });
  } else {
    return res.status(200).json({ isAuthenticated: false });
  }
};

const getAdminStatus = async (req: Request, res: Response) => {
  if (req.session && req.session.userId) {
    try {
      const isAdmin = await userService.getAdminStatusById(req.session.userId);
      if (isAdmin) {
        return res.status(200).json({ isAdmin: true });
      } else {
        return res.status(200).json({ isAdmin: false });
      }
    } catch (err) {
      return res.status(400).json({
        isAdmin: false,
        message: "Unable to verify admin status",
        errors: err,
      });
    }
  }
};

export default { getAuthStatus, getAdminStatus };
