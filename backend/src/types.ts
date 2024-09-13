export interface SalaryFilter {
  page: number;
  rowsPerPage: number;
  sortDirection: "asc" | "desc";
  sortBy?: string;
  companySearch?: string;
  locationSearch?: string;
  specialistsOnly: boolean;
  practiceTypeFilter?: string[];
  isAdminQuery: boolean;
}
