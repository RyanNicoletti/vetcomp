import { Box, Typography, Button, Grid, Alert } from "@mui/material";
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
          Join Veterinarycomp.com's job board today
        </Typography>

        <Typography variant="body1" className="no-jobs-subtitle">
          <span className="free-highlight">FREE</span> posting during beta
          <br />
          Join hundreds of veterinary professionals already using our platform
          <br />
          Attract better candidates who know exactly what you're offering
        </Typography>

        <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Why Choose VeterinaryComp.com:
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2">
                <strong>Salary Transparency</strong>
                <br />
                Attract candidates who match your budget
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2">
                <strong>Veterinary-Only Audience</strong>
                <br />
                No unqualified applicants from other industries
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="body2">
                <strong>Direct Applications</strong>
                <br />
                No recruiter fees or middleman costs
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="body1" className="no-jobs-subtitle">
          Looking for work? Check back later when there are more jobs!
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handlePostJob}
          className="post-job-cta">
          Post a Job - FREE
        </Button>
      </Box>
    </Box>
  );
};

export default NoJobsMessage;
