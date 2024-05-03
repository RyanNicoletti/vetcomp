import { Request, Response, RequestHandler } from "express";
import salariesService from "./salaries.service";
import { SalaryQueryParams } from "./types";

const getAllSalaries = async (req: Request, res: Response) => {
  const salaries = await salariesService.getAll(req.query);
  return res.json({ salaries });
};

export default { getAllSalaries };
