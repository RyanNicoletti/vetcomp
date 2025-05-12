import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsersCompensation } from "../../queries/compensationQueries";
import { getUserJobs } from "../../queries/jobQueries";
import { useSnackbar } from "../../context/SnackbarContext";
import "./Dashboard.css";

import CompensationCards from "./CompensationCards";
import JobPostsSection from "./JobPostsSection";
import { LocationComparison } from "./LocationComparison";
import EmptyDashboard from "./EmptyDashboard";
import DashboardStats from "./DashboardStats";
import { getUserApplications } from "../../queries/jobApplicationQueries";

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { openSnackbar } = useSnackbar();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const {
    data: compensations,
    isLoading: isCompensationsLoading,
    isError: isCompensationsError,
  } = useQuery({
    queryKey: ["userCompensations"],
    queryFn: getUsersCompensation,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["userJobApplications"],
    queryFn: getUserApplications,
  });

  const {
    data: jobs,
    isLoading: isJobsLoading,
    isError: isJobsError,
  } = useQuery({
    queryKey: ["userJobs"],
    queryFn: getUserJobs,
  });

  if (isCompensationsLoading || isJobsLoading) {
    return (
      <div className="loading-container">Loading your dashboard data...</div>
    );
  }

  if (isCompensationsError || isJobsError) {
    return (
      <div className="error-container">
        Error loading dashboard data. Please try refreshing the page.
      </div>
    );
  }

  const hasNoData =
    (!compensations || compensations.length === 0) &&
    (!jobs || jobs.length === 0);

  if (compensations && compensations.length > 0 && !selectedLocation) {
    setSelectedLocation(compensations[0].location);
  }

  if (hasNoData) {
    return <EmptyDashboard />;
  }

  return (
    <div className="dashboard-container">
      <DashboardStats
        compensations={compensations || []}
        jobs={jobs || []}
        jobApplicationsCount={applications?.length}
      />

      {compensations && compensations.length > 0 && (
        <LocationComparison
          userCompensations={compensations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
      )}

      {compensations && compensations.length > 0 && (
        <CompensationCards
          compensations={compensations}
          queryClient={queryClient}
          openSnackbar={openSnackbar}
        />
      )}

      {jobs && jobs.length > 0 && (
        <JobPostsSection
          jobs={jobs}
          queryClient={queryClient}
          openSnackbar={openSnackbar}
        />
      )}
    </div>
  );
};

export default Dashboard;
