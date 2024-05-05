import { Salary } from "../../../../shared-types/types";

export interface SalaryData {
  salaries: Salary[];
  pages: number;
}

export interface SortParams {
  sortDirection: "asc" | "desc";
  sortBy: string;
}
