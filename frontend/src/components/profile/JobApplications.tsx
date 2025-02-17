import { useQuery } from "@tanstack/react-query";
import { Typography, Button } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { getApplicationsForJob } from "../../queries/jobQueries";

interface JobApplicationsProps {
  jobId: string;
}

const JobApplications = ({ jobId }: JobApplicationsProps) => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => getApplicationsForJob(jobId),
  });

  if (isLoading) {
    return <Typography>Loading applications...</Typography>;
  }

  return (
    <div className="applications-preview">
      <div className="applications-header">
        <Typography variant="h6">
          Applications ({applications?.length || 0})
        </Typography>
        <Button
          component={Link}
          to={`/jobs/${jobId}/applications`}
          variant="outlined"
          startIcon={<PeopleIcon />}>
          View All Applications
        </Button>
      </div>
      <Typography variant="body2" color="textSecondary">
        {applications?.length
          ? `${applications.length} application${
              applications.length === 1 ? "" : "s"
            } received`
          : "No applications yet"}
      </Typography>
    </div>
  );
};

export default JobApplications;
