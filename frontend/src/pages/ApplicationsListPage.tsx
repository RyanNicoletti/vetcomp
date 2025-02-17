import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ApplicationsList from "../components/profile/ApplicationsList";
import { getJobById } from "../queries/jobQueries";
import { CircularProgress, Typography } from "@mui/material";

const ApplicationsListPage = () => {
  const { jobId } = useParams();

  const {
    data: jobData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobById(jobId!),
    enabled: !!jobId,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error || !jobData) {
    return <Typography color="error">Error loading job details</Typography>;
  }

  return <ApplicationsList jobId={jobId!} jobTitle={jobData.title} />;
};

export default ApplicationsListPage;
