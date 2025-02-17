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
