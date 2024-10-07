interface FilterState {
  jobTitleSearch: string;
  companySearch: string;
  locationSearch: string;
  jobTypeFilter: string[];
}

export const getAllJobs = async (filters: FilterState) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/jobs?jobTitleSearch=${encodeURIComponent(
      filters.jobTitleSearch
    )}&companySearch=${encodeURIComponent(
      filters.companySearch
    )}&locationSearch=${encodeURIComponent(
      filters.locationSearch
    )}&jobType=${filters.jobTypeFilter.join(",")}`,
    { method: "GET", credentials: "include" }
  );
  if (!response.ok) {
    throw new Error("Failed to get jobs, please try again later.");
  }
  const jobData = await response.json();
  return jobData;
};
