import { NextFunction, Request, Response } from "express";
import { db } from "../db/connection";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.session && req.session.userId) {
      const user = await db("users")
        .where({ id: req.session.userId, is_admin: true })
        .first();
      if (user && user.is_admin) {
        next();
      } else {
        res.status(403).json({
          message: "Forbidden: you are unauthorized to view this content.",
        });
      }
    } else {
      res.status(401).json({ message: "Unauthorized: Please log in" });
    }
  } catch (error) {
    console.error("Unauthorized: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
