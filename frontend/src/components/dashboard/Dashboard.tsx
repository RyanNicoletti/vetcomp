import { useState, useEffect } from "react";
import { Typography, Container, Paper, Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getUsersCompensation } from "../../queries/compensationQueries";
import { getUserJobs } from "../../queries/jobQueries";
import { getUserApplicationsCount } from "../../queries/jobApplicationQueries";
import { ICompensation, JobRecord } from "../../../../shared-types/types";
import LocationCompensationChart from "./LocationCompensationChart";
import UserApplications from "./UserApplications";
import CompensationCards from "./CompensationCards";
import JobPostsSection from "./JobPostsSection";
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

  const {
    data: compensations,
    isLoading: isCompensationsLoading,
    isError: isCompensationsError,
  } = useQuery({
    queryKey: ["userCompensations"],
    queryFn: getUsersCompensation,
  });

  const {
    data: jobs,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["userJobs"],
    queryFn: getUserJobs,
  });

  const {
    data: _applicationsCount = 0,
    isLoading: isApplicationsCountLoading,
  } = useQuery({
    queryKey: ["userApplicationsCount"],
    queryFn: getUserApplicationsCount,
  });

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

  const shouldShowReminder = () => {
    if (!userCompensations || userCompensations.length === 0) {
      return false;
    }
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const allEntriesOld = userCompensations.every((comp) => {
      return new Date(comp.created_at!) < oneYearAgo;
    });

    return allEntriesOld;
  };

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
        VeterinaryComp Dashboard
      </Typography>
      {userCompensations.length > 0 && (
        <Paper elevation={2} className="dashboard-section">
          <LocationCompensationChart userCompensations={userCompensations} />
        </Paper>
      )}

      <Paper elevation={2} className="dashboard-section">
        <CompensationCards
          compensations={userCompensations}
          queryClient={queryClient}
          openSnackbar={openSnackbar}
        />

        {shouldShowReminder() && (
          <Box className="general-reminder">
            <Typography variant="body1">
              Got a new job or has it been over a year since you last posted?
              Help keep our data current by adding your updated compensation
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
        )}
      </Paper>

      <Box className="dashboard-two-column">
        <Paper elevation={2} className="dashboard-section">
          <Typography variant="h5" className="section-title">
            Your Job Applications
          </Typography>
          <UserApplications />
        </Paper>

        <Paper elevation={2} className="dashboard-section">
          {userJobs.length > 0 ? (
            <JobPostsSection
              jobs={userJobs}
              queryClient={queryClient}
              openSnackbar={openSnackbar}
            />
          ) : (
            <>
              <Typography variant="h5" className="section-title">
                Your Job Ads
              </Typography>
              <Typography variant="body1" className="empty-message">
                You haven't posted any jobs yet.
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
