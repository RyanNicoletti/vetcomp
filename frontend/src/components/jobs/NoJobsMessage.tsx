import { Box, Typography, Button } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useNavigate } from "react-router-dom";
import "./NoJobsMessage.css";

const NoJobsMessage = () => {
  const navigate = useNavigate();

  const handlePostJob = () => {
    navigate("/jobs/post");
  };

  return (
    <Box className="no-jobs-message-container">
      <Box className="no-jobs-content">
        <Typography variant="h5" className="no-jobs-title">
          No Job Listings Available
        </Typography>
        <Typography variant="body1" className="no-jobs-subtitle">
          Be the first to post a job or check back later.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handlePostJob}
          className="post-job-cta">
          Post a Job
        </Button>
      </Box>
    </Box>
  );
};

export default NoJobsMessage;
