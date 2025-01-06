import {
  JobFormData,
  JobPost,
  JobsResponse,
  JobFilters,
} from "../components/jobs/types/jobTypes";

interface FilterState {
  companySearch: string;
  locationSearch: string;
  practiceTypeFilter: string[];
  typeFilter: string[];
}
interface SortParams {
  sortDirection: string;
  sortBy: string;
}

export const getAllJobs = async (
  page: number,
  rowsPerPage: number,
  sortParams: SortParams,
  filters: FilterState
): Promise<JobsResponse> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/jobs?page=${page}&rowsPerPage=${rowsPerPage}&sortDirection=${
      sortParams.sortDirection
    }&sortBy=${sortParams.sortBy}&companySearch=${encodeURIComponent(
      filters.companySearch
    )}&locationSearch=${encodeURIComponent(
      filters.locationSearch
    )}&practiceType=${filters.practiceTypeFilter.join(
      ","
    )}&type=${filters.typeFilter.join(",")}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs.");
  }

  const jobsData: JobsResponse = await response.json();
  return jobsData;
};

export const createJob = async (jobData: JobFormData): Promise<JobPost> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jobData),
    credentials: "include",
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw {
      status: response.status,
      message: responseData.message,
      errors: responseData.errors,
    };
  }

  return responseData;
};

export const getJobById = async (id: string): Promise<JobPost> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${id}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch job details.");
  }

  return response.json();
};
