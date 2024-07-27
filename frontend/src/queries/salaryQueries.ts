import { CompensationDetailsWithPages } from "../../../shared-types/types";
import { SortParams } from "../components/salarytable/types";

export const getAllSalaries = async (
  page: number,
  rowsPerPage: number,
  sortParams: SortParams
): Promise<CompensationDetailsWithPages> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/salaries?page=${page}&rowsPerPage=${rowsPerPage}&sortDirection=${
      sortParams.sortDirection
    }&sortBy=${sortParams.sortBy}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch salaries.");
  }
  const salaryData: CompensationDetailsWithPages = await response.json();
  return salaryData;
};
