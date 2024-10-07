interface SearchParams {
  jobTitle?: string;
  company?: string;
  location?: string;
  jobType?: string[];
}

export const getAllJobs = async (searchParams: SearchParams) => {
  const queryParams = new URLSearchParams();
  if (searchParams.jobTitle)
    queryParams.append("jobTitle", searchParams.jobTitle);
  if (searchParams.company) queryParams.append("company", searchParams.company);
  if (searchParams.location)
    queryParams.append("location", searchParams.location);
  if (searchParams.jobType && searchParams.jobType.length > 0) {
    queryParams.append("jobType", searchParams.jobType.join(","));
  }

  const url = `${
    import.meta.env.VITE_API_BASE_URL
  }/jobs?${queryParams.toString()}`;

  const response = await fetch(url, { method: "GET", credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to get jobs, please try again later.");
  }

  return response.json();
};
