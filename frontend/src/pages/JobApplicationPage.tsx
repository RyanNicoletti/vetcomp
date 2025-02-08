import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Alert } from "@mui/material";
import { getJobById } from "../queries/jobQueries";
import JobApplicationForm from "../components/jobs/JobApplicationForm";

const JobApplicationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("Job ID is required");
      return getJobById(jobId);
    },
    enabled: !!jobId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={4}>
        <Alert severity="error">Failed to load job details</Alert>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box m={4}>
        <Alert severity="error">Job not found</Alert>
      </Box>
    );
  }

  if (job.application_method === "external" && job.application_url) {
    window.location.href = job.application_url;
    return null;
  }

  return (
    <Box className="application-page-container">
      <JobApplicationForm
        job={job}
        open={true}
        onClose={() => navigate("/jobs")}
      />
    </Box>
  );
};

export default JobApplicationPage;
