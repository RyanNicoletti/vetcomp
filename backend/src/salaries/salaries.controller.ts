import { Request, Response } from "express";
import salariesService from "./salaries.service";

const getAllSalaries = async (req: Request, res: Response) => {
  const salaries = await salariesService.getAll();
  return res.json({ salaries });
};

export default { getAllSalaries };
