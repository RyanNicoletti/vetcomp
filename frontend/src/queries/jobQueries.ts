import { convertCurrencyToNumber } from "../utils/moneyFormatter";
import {
  JobFormData,
  JobPost,
  JobsResponse,
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

const formatJobData = (formData: JobFormData) => ({
  title: formData.title,
  company: formData.company,
  location: formData.location,
  type: formData.type,
  practice_type: formData.practiceType,
  salary_min: convertCurrencyToNumber(formData.salaryMin),
  salary_max: convertCurrencyToNumber(formData.salaryMax),
  sign_on_bonus: formData.signOnBonus
    ? convertCurrencyToNumber(formData.signOnBonus)
    : null,
  description: formData.description,
  requirements: formData.requirements || null,
  benefits: formData.benefits || null,
  application_url: formData.applicationUrl || null,
});

export const createJob = async (formData: JobFormData): Promise<JobPost> => {
  const apiData = formatJobData(formData);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(apiData),
    credentials: "include",
  });

  const responseData = await response.json();
  if (!response.ok) {
    if (responseData.error?.details) {
      const transformedErrors = responseData.error.details.map(
        (error: any) => ({
          ...error,
          path: error.path.map((p: string) => {
            switch (p) {
              case "practice_type":
                return "practiceType";
              case "salary_min":
                return "salaryMin";
              case "salary_max":
                return "salaryMax";
              case "sign_on_bonus":
                return "signOnBonus";
              case "application_url":
                return "applicationUrl";
              default:
                return p;
            }
          }),
        })
      );
      throw {
        status: response.status,
        message: "Validation failed",
        errors: transformedErrors,
      };
    }
    throw {
      status: response.status,
      message: responseData.message || "Failed to create job posting",
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
