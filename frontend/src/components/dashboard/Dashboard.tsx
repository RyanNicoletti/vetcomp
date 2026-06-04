import { useState, useEffect } from "react";
import { Typography, Container, Paper, Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getUsersCompensation } from "../../queries/compensationQueries";
import { ICompensation } from "../../../../shared-types/types";
import LocationCompensationChart from "./LocationCompensationChart";
import CompensationCards from "./CompensationCards";
import { useSnackbar } from "../../context/SnackbarContext";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export const Dashboard = () => {
  const [userCompensations, setUserCompensations] = useState<ICompensation[]>(
    []
  );
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

 
  useEffect(() => {
    if (compensations) {
      setUserCompensations(compensations);
    }
  }, [compensations]);


  const shouldShowReminder = () => {
    if (!userCompensations || userCompensations.length === 0) {
      return false;
    }
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const allEntriesOld = userCompensations.every((comp) => {
      return new Date(comp.created_at!) < twoYearsAgo;
    });

    return allEntriesOld;
  };

  if (isCompensationsLoading) {
    return (
      <Container className="dashboard-loading">
        <Typography variant="h6">Loading your dashboard...</Typography>
      </Container>
    );
  }

  if (isCompensationsError) {
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
              Got a new job or has it been over 2 years since you last posted?
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

    </Container>
  );
};

export default Dashboard;
