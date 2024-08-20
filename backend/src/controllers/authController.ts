import { Request, Response } from "express";

const getAuthStatus = (req: Request, res: Response) => {
  if (req.session && req.session.userId) {
    return res.status(200).json({ isAuthenticated: true });
  } else {
    return res.status(200).json({ isAuthenticated: false });
  }
};

export default { getAuthStatus };
