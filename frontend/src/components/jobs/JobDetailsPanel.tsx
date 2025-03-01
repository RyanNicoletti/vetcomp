import {
  Box,
  Typography,
  Button,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { JobRecord } from "../../../../shared-types/types";
import { moneyFormatter } from "../../utils/moneyFormatter";
import "./JobDetailsPanel.css";

interface JobDetailsPanelProps {
  job: JobRecord;
  onClose: () => void;
}

const JobDetailsPanel = ({ job, onClose }: JobDetailsPanelProps) => {
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (job.application_method === "external" && job.application_url) {
      window.location.href = job.application_url;
    } else {
      navigate(`/jobs/${job.id}/apply`);
    }
  };

  return (
    <Box className="job-details-panel-container">
      <Box className="job-details-header">
        <Typography variant="h5" className="job-details-title">
          {job.title}
        </Typography>

        <IconButton
          onClick={onClose}
          className="job-details-close-btn"
          size="large"
          aria-label="close job details">
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="h6" color="primary" className="job-details-company">
        {job.company}
      </Typography>

      <Box className="job-details-meta">
        <Typography variant="body1" className="job-details-location">
          {job.location}
        </Typography>
        <Chip label={job.type} size="small" className="job-details-type-chip" />
        <Chip
          label={job.practice_type}
          size="small"
          className="job-details-practice-chip"
        />
      </Box>

      <Box className="job-details-salary">
        <Typography variant="subtitle1">
          Salary Range: {moneyFormatter.format(job.salary_min)} -{" "}
          {moneyFormatter.format(job.salary_max)}
        </Typography>
        {job.sign_on_bonus && (
          <Typography variant="subtitle2" className="job-details-bonus">
            Sign-on Bonus: {moneyFormatter.format(job.sign_on_bonus)}
          </Typography>
        )}
      </Box>

      <Divider className="job-details-divider" />

      <Box className="job-details-section">
        <Typography variant="subtitle1" className="job-details-section-title">
          Description
        </Typography>
        <Typography variant="body2" className="job-details-description">
          {job.description}
        </Typography>
      </Box>

      {job.requirements && (
        <Box className="job-details-section">
          <Typography variant="subtitle1" className="job-details-section-title">
            Requirements
          </Typography>
          <Typography variant="body2" className="job-details-requirements">
            {job.requirements}
          </Typography>
        </Box>
      )}

      {job.benefits && (
        <Box className="job-details-section">
          <Typography variant="subtitle1" className="job-details-section-title">
            Benefits
          </Typography>
          <Typography variant="body2" className="job-details-benefits">
            {job.benefits}
          </Typography>
        </Box>
      )}

      <Box className="job-details-actions">
        <Button
          variant="contained"
          color="primary"
          className="job-details-apply-btn"
          onClick={handleApplyClick}>
          Apply Now
        </Button>
      </Box>
      <Box className="job-details-mobile-actions">
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{ mt: 2, display: { md: "none" } }}>
          Back to Job Listings
        </Button>
      </Box>
    </Box>
  );
};

export default JobDetailsPanel;
