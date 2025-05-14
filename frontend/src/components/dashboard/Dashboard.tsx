import { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Paper,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getUsersCompensation } from "../../queries/compensationQueries";
import { getUserJobs } from "../../queries/jobQueries";
import { getUserApplicationsCount } from "../../queries/jobApplicationQueries";
import { ICompensation, JobRecord } from "../../../../shared-types/types";
import LocationCompensationChart from "./LocationCompensationChart";
import UserApplications from "./UserApplications";
import CompensationCards from "./CompensationCards";
import { useSnackbar } from "../../context/SnackbarContext";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export const Dashboard = () => {
  const [userCompensations, setUserCompensations] = useState<ICompensation[]>(
    []
  );
  const [userJobs, setUserJobs] = useState<JobRecord[]>([]);
  const queryClient = useQueryClient();
  const { openSnackbar } = useSnackbar();

  // Fetch user's compensations
  const {
    data: compensations,
    isLoading: isCompensationsLoading,
    isError: isCompensationsError,
  } = useQuery({
    queryKey: ["userCompensations"],
    queryFn: getUsersCompensation,
  });

  // Fetch user's job postings
  const {
    data: jobs,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["userJobs"],
    queryFn: getUserJobs,
  });

  // Fetch job applications count
  const { data: applicationsCount = 0, isLoading: isApplicationsCountLoading } =
    useQuery({
      queryKey: ["userApplicationsCount"],
      queryFn: getUserApplicationsCount,
    });

  // Update state when data is loaded
  useEffect(() => {
    if (compensations) {
      setUserCompensations(compensations);
    }
    if (jobs) {
      setUserJobs(jobs);
    }
  }, [compensations, jobs]);

  const isLoading =
    isCompensationsLoading || isJobsLoading || isApplicationsCountLoading;
  const isError = isCompensationsError || isJobsError;

  if (isLoading) {
    return (
      <Container className="dashboard-loading">
        <Typography variant="h6">Loading your dashboard...</Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="dashboard-error">
        <Typography variant="h6">
          Error loading dashboard data. Please try refreshing the page.
        </Typography>
      </Container>
    );
  }

  return (
    <Container className="dashboard-container">
      <Typography variant="h4" className="dashboard-title">
        Your Dashboard
      </Typography>

      {/* User's Compensation Cards - Now at the top for immediate accessibility */}
      <Paper elevation={2} className="dashboard-section">
        <CompensationCards
          compensations={userCompensations}
          queryClient={queryClient}
          openSnackbar={openSnackbar}
        />

        {/* General reminder for all users */}
        <Box className="general-reminder">
          <Typography variant="body1">
            Got a new job or has it been over a year since you last posted? Help
            keep our data current by adding your updated compensation
            information.
          </Typography>
          <Button
            component={Link}
            to="/addcomp"
            variant="contained"
            color="primary"
            className="reminder-action-btn">
            Add New Compensation
          </Button>
        </Box>
      </Paper>

      {/* Compensation Chart - Moved below the cards */}
      {userCompensations.length > 0 ? (
        <Paper elevation={2} className="dashboard-section">
          <LocationCompensationChart userCompensations={userCompensations} />
        </Paper>
      ) : (
        <Paper elevation={2} className="dashboard-section empty-section">
          <Typography variant="h6">
            No compensation data to visualize
          </Typography>
          <Typography variant="body1">
            Add your compensation information to see how you compare to others
            in your location.
          </Typography>
        </Paper>
      )}

      <Box className="dashboard-two-column">
        <Paper elevation={2} className="dashboard-section">
          <Typography variant="h5" className="section-title">
            Your Job Applications
          </Typography>
          <UserApplications />
        </Paper>

        <Paper elevation={2} className="dashboard-section">
          <Typography variant="h5" className="section-title">
            Your Job Postings
          </Typography>
          {userJobs.length > 0 ? (
            <div className="user-jobs-list">
              {userJobs.map((job) => (
                <Box key={job.id} className="user-job-item">
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="body2">{job.company}</Typography>
                  <Typography variant="body2">
                    Status:{" "}
                    <span className={`status-${job.status}`}>{job.status}</span>
                  </Typography>
                </Box>
              ))}
            </div>
          ) : (
            <Typography variant="body1" className="empty-message">
              You haven't posted any jobs yet.
            </Typography>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
