import {
  IJobFormData,
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

export const getUserJobs = async (): Promise<JobRecord[]> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/profile`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user jobs");
  }
  return response.json();
};

export const deleteJobPost = async (jobId: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}/cancel`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );
  if (!response.ok) {
    throw new Error("Failed to delete job post");
  }
};

// UNCOMMENT THIS WHEN IMPLEMENTING PAID JOBS
// export const createJob = async (data: IJobFormData): Promise<JobRecord> => {
//   const formData = new FormData();
//   formData.append("newJob", JSON.stringify(data));

//   const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: formData,
//     credentials: "include",
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.message || "Failed to create job");
//   }

//   return response.json();
// };

export const createJobFree = async (jobData: IJobFormData) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(jobData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to create job");
  }

  return response.json();
};

export const getJobById = async (id: string): Promise<JobRecord> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${id}`,
    { method: "GET", credentials: "include" }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch job details.");
  }

  return response.json();
};

export const getApplicationsForJob = async (jobId: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}/applications`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: string
) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/jobs/applications/${applicationId}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update application status");
  }

  return response.json();
};
