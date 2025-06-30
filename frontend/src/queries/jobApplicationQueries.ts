export const submitJobApplication = async (
  jobId: string,
  formData: FormData
) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/${jobId}/apply`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit application");
  }

  return response.json();
};

export const getUserApplications = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/applications`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch applications");
  }

  return response.json();
};

// Replace the existing getUserApplicationsCount function in frontend/src/queries/jobApplicationQueries.ts with this:

export const getUserApplicationsCount = async (): Promise<number> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/jobs/applications/count`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch application count, returning 0");
      return 0;
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.warn("Error fetching application count, returning 0:", error);
    return 0;
  }
};

export const deleteApplication = async (
  applicationId: string
): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/jobs/applications/${applicationId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete application");
  }
};
