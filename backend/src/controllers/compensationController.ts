import { Request, Response } from "express";
import compensationService from "../services/compensationService";

interface SalaryFilter {
  page: number;
  rowsPerPage: number;
  sortDirection: "asc" | "desc";
  sortBy?: string;
}

const getAllSalaries = async (req: Request, res: Response) => {
  const salaryFilter: SalaryFilter = {
    page: 1,
    rowsPerPage: 10,
    sortDirection: "asc",
    sortBy: "",
  };
  if (typeof req.query.page === "string") {
    const pageNumber: number = parseInt(req.query.page, 10);
    const oneIndexedPageNumber: number = pageNumber - 1;
    salaryFilter.page = oneIndexedPageNumber;
  }
  if (typeof req.query.rowsPerPage === "string") {
    salaryFilter.rowsPerPage = parseInt(req.query.rowsPerPage, 10);
  }
  if (typeof req.query.sortDirection === "string") {
    if (
      req.query.sortDirection === "asc" ||
      req.query.sortDirection === "desc"
    ) {
      salaryFilter.sortDirection = req.query.sortDirection;
    }
  }
  if (typeof req.query.sortBy === "string" && req.query.sortBy !== "") {
    salaryFilter.sortBy = req.query.sortBy;
  }

  const compensationsWithPages = await compensationService.getAll(salaryFilter);
  return res.json(compensationsWithPages);
};

const addCompensation = async (req: Request, res: Response) => {
  console.log(req.body);
};

export default { getAllSalaries, addCompensation };
