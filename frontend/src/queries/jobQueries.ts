import {
  JobFormData,
  JobPosting,
  JobsResponse,
  JobFilters,
} from "../components/jobs/types/jobTypes";

export const getAllJobs = async (
  filters: JobFilters
): Promise<JobsResponse> => {
  const queryParams = new URLSearchParams({
    page: filters.page.toString(),
    ...(filters.searchTerm && { search: filters.searchTerm }),
    ...(filters.practiceType && { practiceType: filters.practiceType }),
    ...(filters.locationType && { locationType: filters.locationType }),
  });

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs?${queryParams}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch jobs.");
  }

  return response.json();
};

export const createJob = async (jobData: JobFormData): Promise<JobPosting> => {
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

export const getJobById = async (id: string): Promise<JobPosting> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${id}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch job details.");
  }

  return response.json();
};
