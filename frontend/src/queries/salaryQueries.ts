import { SortParams } from "../components/salarytable/types";

export const getAllSalaries = async (
  page: number,
  rowsPerPage: number,
  sortParams: SortParams
) => {
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
  const { salaries } = await response.json();
  return salaries;
};
