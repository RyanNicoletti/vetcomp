import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useUserStatus } from "../../hooks/useUserStatus";
import "./JobsList.css";
import { mockJobs } from "./mock/fakedata";
import JobCard from "./JobCard";

const JobsList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStatus();
  const jobs: any[] = mockJobs; // Will be replaced with React Query

  const handlePostJob = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/jobs/post");
    } else {
      navigate("/jobs/post");
    }
  };

  return (
    <Container className="jobs-container">
      <Box className="jobs-header">
        <Typography variant="h4" component="h1">
          Veterinary Jobs
        </Typography>
        <Button
          variant="contained"
          onClick={handlePostJob}
          className="post-job-button"
          startIcon={<AddCircleOutlineIcon />}>
          Post a Job
        </Button>
      </Box>

      {jobs.length === 0 ? (
        <Card className="empty-jobs-card">
          <CardContent className="empty-jobs-content">
            <WorkOutlineIcon className="jobs-icon" />
            <Typography variant="h5" component="h2">
              No Jobs Posted
            </Typography>
            <Typography variant="body1" className="empty-jobs-message">
              There are currently no job listings available. Check back later or
              be the first to post a position.
            </Typography>
            <Button
              variant="outlined"
              onClick={handlePostJob}
              startIcon={<AddCircleOutlineIcon />}
              className="post-job-button-secondary">
              Post a Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box className="jobs-grid">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default JobsList;
