import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { getAllJobs } from "../../queries/jobQueries";
import { JobFilters, JobsSortParams } from "./types/jobTypes";
import JobCard from "./JobCard";
import { SearchAndFilter } from "./SearchAndFilter";
import "./JobsList.css";

const JobsList = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    rowsPerPage: 10,
    companySearch: "",
    locationSearch: "",
    practiceTypeFilter: [],
    typeFilter: [],
  });

  const [sortParams, setSortParams] = useState<JobsSortParams>({
    sortDirection: "asc",
    sortBy: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs", filters.page, filters.rowsPerPage, sortParams, filters],
    queryFn: () =>
      getAllJobs(filters.page, filters.rowsPerPage, sortParams, {
        companySearch: filters.companySearch ?? "",
        locationSearch: filters.locationSearch ?? "",
        practiceTypeFilter: filters.practiceTypeFilter ?? [],
        typeFilter: filters.typeFilter ?? [],
      }),
  });

  const handleSearch = (
    searchFilters: Omit<JobFilters, "page" | "rowsPerPage">
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...searchFilters,
      page: 1,
    }));
  };

  const handlePostJob = () => {
    navigate("/jobs/post");
  };

  if (isLoading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container>
        <Alert severity="error">
          Failed to load jobs. Please try again later.
        </Alert>
      </Container>
    );
  }

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

      <SearchAndFilter
        onSearch={handleSearch}
        initialFilters={{
          companySearch: filters.companySearch,
          locationSearch: filters.locationSearch,
          practiceTypeFilter: filters.practiceTypeFilter,
          typeFilter: filters.typeFilter,
        }}
      />

      {!data?.jobs || data.jobs.length === 0 ? (
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
          {data.jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default JobsList;
