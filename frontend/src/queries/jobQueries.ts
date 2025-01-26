import { convertCurrencyToNumber } from "../utils/moneyFormatter";
import {
  JobFormData,
  JobRecord,
  JobResponse,
} from "../../../shared-types/types";

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
): Promise<JobResponse> => {
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

  const jobsData: JobResponse = await response.json();
  return jobsData;
};

const formatJobData = (formData: JobFormData) => ({
  title: formData.title,
  company: formData.company,
  location: formData.location,
  type: formData.type,
  practiceType: formData.practiceType,
  salaryMin: convertCurrencyToNumber(formData.salaryMin),
  salaryMax: convertCurrencyToNumber(formData.salaryMax),
  signOnBonus: formData.signOnBonus
    ? convertCurrencyToNumber(formData.signOnBonus)
    : null,
  description: formData.description,
  requirements: formData.requirements || null,
  benefits: formData.benefits || null,
  applicationMethod: formData.applicationMethod,
  contactEmail: formData.contactEmail || null,
  applicationUrl: formData.applicationUrl || null,
});

export const createJob = async (data: JobFormData): Promise<JobRecord> => {
  const formData = new FormData();
  formData.append("newJob", JSON.stringify(data));

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create job");
  }

  return response.json();
};

export const getJobById = async (id: string): Promise<JobRecord> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${id}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch job details.");
  }

  return response.json();
};
