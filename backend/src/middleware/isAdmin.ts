import { NextFunction, Request, Response } from "express";
import { db } from "../db/connection";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.session || !req.session.userId) {
      res.status(401).json({ message: "Unauthorized: Please log in" });
    }
    const user = await db("users")
      .where({ id: req.session.userId, is_admin: true })
      .first();
    if (!user || !user.is_admin) {
      res
        .status(403)
        .json({ message: "Forbidden: unauthorized to view this content." });
    }
    next();
  } catch (error) {
    console.error("Unauthorized: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
