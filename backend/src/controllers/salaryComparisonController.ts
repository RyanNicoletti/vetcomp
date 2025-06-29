import { Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { db } from "../db/connection";
import salaryComparisonService from "../services/salaryComparisonService";
import { UnauthorizedError, NotFoundError } from "../errors/httpErrors";

const getSalaryComparison = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.session || !req.session.userId) {
      throw new UnauthorizedError(
        "Authentication required to access salary comparison"
      );
    }

    const userId = req.session.userId;

    const comparisonResult =
      await salaryComparisonService.getUserSalaryComparison(db, userId);

    if (!comparisonResult) {
      throw new NotFoundError(
        "No approved compensation data found for comparison. Please submit your compensation information first."
      );
    }

    res.json(comparisonResult);
  }
);

export default {
  getSalaryComparison,
};
