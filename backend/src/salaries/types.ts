export interface SalaryFilter {
  page: number;
  rowsPerPage: number;
  sortDirection: "asc" | "desc";
  sortBy?: string;
}
