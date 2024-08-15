import {
  CompensationDetailsWithPages,
  ICompFormInput,
} from "../../../shared-types/types";
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

export const createCompensation = async (data: ICompFormInput) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/salaries`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }
  const addCompResponse = await response.json();
  return addCompResponse;
};
