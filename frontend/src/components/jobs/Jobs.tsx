import { Box, Button, CircularProgress } from "@mui/material";
import { getAllJobs } from "../../queries/jobsQueries";
import { useState } from "react";
import { JobsSearch } from "./JobsSearch";
import { useQuery } from "@tanstack/react-query";
import { JobsList } from "./JobsList";
import { SearchParams } from "./types";

export const Jobs = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const {
    data: jobsData,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ["jobs", searchParams],
    queryFn: () => getAllJobs(searchParams),
  });

  const handleJobsSearch = (searchParams) => {
    setSearchParams((prev) => ({ ...prev, ...searchParams }));
  };
  console.log("yeet", jobsData);
  if (isPending) {
    return (
      <Box>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>Error: {(error as Error).message}. Please try again later.</Box>
    );
  }

  return (
    <Box className="jobs-container">
      <Box className="jobs-actions-container">
        <Button>Post a job</Button>
        <JobsSearch searchParams={searchParams} onSearch={handleJobsSearch} />
      </Box>
      <JobsList jobs={jobsData} />
    </Box>
  );
};
