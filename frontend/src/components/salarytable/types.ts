import { CompensationDetails } from "../../../../shared-types/types";

export interface SalaryData {
  salaries: CompensationDetails[];
  pages: number;
}

export interface SortParams {
  sortDirection: "asc" | "desc";
  sortBy: string;
}
