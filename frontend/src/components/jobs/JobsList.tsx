import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { getAllJobs } from "../../queries/jobQueries";
import JobCard from "./JobCard";
import { SearchAndFilter } from "./SearchAndFilter";
import "./JobsList.css";
import { JobRecord } from "../../../../shared-types/types";
import JobDetailsPanel from "./JobDetailsPanel";
import NoJobsMessage from "./NoJobsMessage";

export interface JobFilters {
  page: number;
  rowsPerPage: number;
  companySearch?: string;
  locationSearch?: string;
  practiceTypeFilter?: string[];
  typeFilter?: string[];
}

export interface JobsSortParams {
  sortDirection: "asc" | "desc";
  sortBy: string;
}

const JobsList = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    rowsPerPage: 10,
    companySearch: "",
    locationSearch: "",
    practiceTypeFilter: [],
    typeFilter: [],
  });

  const [sortParams, _setSortParams] = useState<JobsSortParams>({
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

  const handleJobSelect = (job: JobRecord) => {
    setSelectedJob(job === selectedJob ? null : job);
  };

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

  const hasJobs = data?.jobs.length ?? 0 > 0;

  return (
    <Container className="jobs-container" maxWidth={false}>
      <Box className="jobs-header">
        <Typography variant="h4" component="h1">
          Job Listings
        </Typography>
        <Button
          variant="contained"
          onClick={handlePostJob}
          className="post-job-button"
          startIcon={<AddCircleOutlineIcon />}>
          Post a free Job
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

      {hasJobs ? (
        <Box className="jobs-layout">
          <Box className="jobs-list">
            {data?.jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onSelect={() => handleJobSelect(job)}
              />
            ))}
          </Box>

          {selectedJob && (
            <Box className="job-details-panel">
              <JobDetailsPanel
                job={selectedJob}
                onClose={() => setSelectedJob(null)}
              />
            </Box>
          )}
        </Box>
      ) : (
        <NoJobsMessage />
      )}
    </Container>
  );
};

export default JobsList;
